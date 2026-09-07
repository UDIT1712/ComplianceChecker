from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class QueryRequest(BaseModel):
    query: str
    jurisdiction_filter: Optional[str] = None
    doc_type_filter: Optional[str] = None
    top_k: Optional[int] = None

class Citation(BaseModel):
    document_id: str
    document_name: str
    section: Optional[str] = None
    text_snippet: str
    score: float

class ConflictInfo(BaseModel):
    has_conflict: bool
    conflict_description: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence_score: float
    conflicts: Optional[ConflictInfo] = None

class DocumentResponse(BaseModel):
    id: str
    name: str
    type: Optional[str]
    jurisdiction: Optional[str]
    status: str
    chunk_count: int
    date: Optional[str] = None

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int

class HealthResponse(BaseModel):
    status: str
    database: str
    qdrant: str
