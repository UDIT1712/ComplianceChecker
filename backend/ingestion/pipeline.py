import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.models import Chunk, Document
from backend.ingestion.chunker import ParentChildChunker
from backend.ingestion.metadata_extractor import MetadataExtractor
from backend.ingestion.parser import DocumentParser
from backend.retrieval.embedder import Embedder
from backend.retrieval.sparse_embedder import SparseEmbedder
from backend.retrieval.vector_store import VectorStore


class IngestionPipeline:
    def __init__(self):
        self.parser = DocumentParser()
        self.chunker = ParentChildChunker()
        self.metadata_extractor = MetadataExtractor()
        self.embedder = Embedder()
        self.sparse_embedder = SparseEmbedder()
        self.vector_store = VectorStore()

    async def ingest(self, db: AsyncSession, file_path: str, original_filename: str) -> Document:
        parsed = self.parser.parse(file_path)
        text = parsed["text"]
        if not text.strip():
            raise ValueError("No extractable text found in document")

        extracted = self.metadata_extractor.extract(text)

        document = Document(
            name=original_filename,
            type=extracted.get("doc_type"),
            jurisdiction=extracted.get("jurisdiction"),
            status="Processing",
        )
        db.add(document)
        await db.flush()  # populate document.id for use below

        chunks = self.chunker.chunk(
            text,
            metadata={
                "document_id": document.id,
                "document_name": document.name,
                "doc_type": document.type,
                "jurisdiction": document.jurisdiction,
            },
        )

        # The chunker hands out local placeholder ids ("parent_0", "child_0_1", ...);
        # remap to real UUIDs so both the Postgres FK and the Qdrant point ids are valid.
        id_map = {c["id"]: str(uuid.uuid4()) for c in chunks}

        parent_rows, child_rows = [], []
        child_ids, child_texts, child_payloads = [], [], []

        for position, c in enumerate(chunks):
            real_id = id_map[c["id"]]
            parent_real_id = id_map.get(c.get("parent_id")) if c.get("parent_id") else None

            row = Chunk(
                id=real_id,
                document_id=document.id,
                text=c["text"],
                parent_id=parent_real_id,
                position=position,
                metadata_={"is_parent": c["is_parent"]},
            )

            if c["is_parent"]:
                parent_rows.append(row)
                continue

            # Only child chunks are embedded/searched; parents are kept in Postgres
            # for future context-expansion, not indexed themselves.
            child_rows.append(row)
            child_ids.append(real_id)
            child_texts.append(c["text"])
            child_payloads.append(
                {
                    "text": c["text"],
                    "document_id": document.id,
                    "document_name": document.name,
                    "doc_type": document.type,
                    "jurisdiction": document.jurisdiction,
                    "parent_id": parent_real_id,
                }
            )

        # Insert parents (and flush) before children so the parent_id FK is satisfied
        # regardless of how the session batches same-table inserts.
        db.add_all(parent_rows)
        await db.flush()
        db.add_all(child_rows)

        if child_ids:
            dense_vectors = self.embedder.embed_documents(child_texts)
            sparse_vectors = self.sparse_embedder.embed_documents(child_texts)
            self.vector_store.upsert(
                ids=child_ids,
                dense_vectors=dense_vectors,
                sparse_vectors=sparse_vectors,
                payloads=child_payloads,
            )

        document.status = "Ready"
        document.chunk_count = len(child_ids)
        await db.commit()
        await db.refresh(document)
        return document
