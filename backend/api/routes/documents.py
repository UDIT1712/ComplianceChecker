import logging
import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas import DocumentListResponse, DocumentResponse
from backend.database.models import Document
from backend.database.session import get_db
from backend.ingestion.pipeline import IngestionPipeline

logger = logging.getLogger(__name__)
router = APIRouter()
pipeline = IngestionPipeline()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".html"}


def _to_response(document: Document) -> DocumentResponse:
    return DocumentResponse(
        id=document.id,
        name=document.name,
        type=document.type,
        jurisdiction=document.jurisdiction,
        status=document.status,
        chunk_count=document.chunk_count,
        date=document.upload_date.isoformat() if document.upload_date else None,
    )


@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext or 'unknown'}")

    contents = await file.read()
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        document = await pipeline.ingest(db, tmp_path, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Document ingestion failed for %s", file.filename)
        raise HTTPException(status_code=500, detail="Failed to process document")
    finally:
        os.unlink(tmp_path)

    return _to_response(document)


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).order_by(Document.upload_date.desc()))
    documents = result.scalars().all()
    return DocumentListResponse(
        documents=[_to_response(d) for d in documents],
        total=len(documents),
    )
