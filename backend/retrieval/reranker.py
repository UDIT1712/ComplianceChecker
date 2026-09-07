import cohere
from langfuse import get_client, observe

from backend.config import settings


class Reranker:
    def __init__(self):
        self.client = cohere.ClientV2(api_key=settings.COHERE_API_KEY) if settings.COHERE_API_KEY else None
        self.model = settings.COHERE_RERANK_MODEL

    @observe(name="cohere_rerank", as_type="span", capture_output=False)
    def rerank(self, query: str, documents: list[str], top_n: int = 5) -> list[tuple[int, float | None]]:
        if not documents:
            return []

        top_n = min(top_n, len(documents))

        if not self.client:
            # No Cohere key configured: fall back to the incoming order (assumed pre-sorted by vector score).
            get_client().update_current_span(
                metadata={"cohere_enabled": False, "num_documents": len(documents), "top_n": top_n}
            )
            return [(i, None) for i in range(top_n)]

        response = self.client.rerank(
            model=self.model,
            query=query,
            documents=documents,
            top_n=top_n,
        )
        ranked = [(r.index, r.relevance_score) for r in response.results]
        get_client().update_current_span(
            metadata={
                "cohere_enabled": True,
                "model": self.model,
                "num_documents": len(documents),
                "top_n": top_n,
                "scores": [score for _, score in ranked],
            }
        )
        return ranked
