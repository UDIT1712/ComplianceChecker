from fastembed import SparseTextEmbedding
from langfuse import get_client, observe


class SparseEmbedder:
    MODEL_NAME = "Qdrant/bm25"

    def __init__(self):
        self.model = SparseTextEmbedding(model_name=self.MODEL_NAME)

    @observe(name="sparse_embed_documents", as_type="embedding", capture_output=False)
    def embed_documents(self, texts: list[str]) -> list[dict]:
        vectors = [
            {"indices": e.indices.tolist(), "values": e.values.tolist()}
            for e in self.model.embed(texts)
        ]
        get_client().update_current_generation(
            model=self.MODEL_NAME,
            metadata={"num_texts": len(texts)},
        )
        return vectors

    @observe(name="sparse_embed_query", as_type="embedding", capture_output=False)
    def embed_query(self, text: str) -> dict:
        e = next(self.model.query_embed(text))
        get_client().update_current_generation(model=self.MODEL_NAME)
        return {"indices": e.indices.tolist(), "values": e.values.tolist()}
