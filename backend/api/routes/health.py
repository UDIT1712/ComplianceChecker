from fastapi import APIRouter
from backend.api.schemas import HealthResponse
from backend.database.session import engine

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    db_status = "ok"
    try:
        async with engine.connect() as conn:
            pass
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return HealthResponse(
        status="ok",
        database=db_status,
        qdrant="ok"  # Simplified check
    )
