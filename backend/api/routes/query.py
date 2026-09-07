from fastapi import APIRouter
from backend.api.schemas import QueryRequest, QueryResponse
from backend.generation.rag_chain import RAGChain

router = APIRouter()
rag_chain = RAGChain()

@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    result = await rag_chain.process_query(
        request.query,
        top_k=request.top_k,
        jurisdiction=request.jurisdiction_filter,
        doc_type=request.doc_type_filter,
    )
    return QueryResponse(
        answer=result.get("answer", ""),
        citations=result.get("citations", []),
        confidence_score=result.get("confidence_score", 0.0),
        conflicts=result.get("conflicts"),
    )
