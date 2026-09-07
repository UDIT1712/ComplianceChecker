import asyncio
from dataclasses import dataclass

from langfuse import get_client, observe

from backend.config import settings
from backend.retrieval.embedder import Embedder
from backend.retrieval.query_transform import QueryTransformer
from backend.retrieval.reranker import Reranker
from backend.retrieval.sparse_embedder import SparseEmbedder
from backend.retrieval.vector_store import VectorStore


@dataclass
class RetrievedChunk:
    id: str
    score: float
    payload: dict


class Retriever:
    def __init__(self):
        self.embedder = Embedder()
        self.sparse_embedder = SparseEmbedder()
        self.vector_store = VectorStore()
        self.reranker = Reranker()
        self.query_transformer = QueryTransformer()

    @observe(name="hybrid_retrieve_one", as_type="span", capture_output=False)
    def _hybrid_search_sync(self, query_text: str, limit: int, query_filter):
        dense_vector = self.embedder.embed_query(query_text)
        sparse_vector = self.sparse_embedder.embed_query(query_text)
        points = self.vector_store.hybrid_search(
            dense_vector=dense_vector,
            sparse_vector=sparse_vector,
            limit=limit,
            query_filter=query_filter,
        )
        get_client().update_current_span(metadata={"num_results": len(points)})
        return points

    async def _search(self, query_text: str, limit: int, query_filter):
        return await asyncio.to_thread(self._hybrid_search_sync, query_text, limit, query_filter)

    @observe(name="retrieve", as_type="chain")
    async def retrieve(
        self,
        query: str,
        top_k: int = None,
        jurisdiction: str = None,
        doc_type: str = None,
        use_hyde: bool = True,
        use_decomposition: bool = True,
        min_hits_before_retry: int = 2,
    ):
        top_k = top_k or settings.TOP_K
        query_filter = self.vector_store.build_filter(jurisdiction=jurisdiction, doc_type=doc_type)
        fetch_limit = max(top_k * 4, 20)

        # 1. Query transformation: decompose into sub-questions (if useful), then HyDE each one.
        search_queries = [query]
        if use_decomposition:
            sub_queries = await self.query_transformer.decompose(query)
            if len(sub_queries) > 1:
                search_queries = sub_queries

        search_passages = (
            await asyncio.gather(*[self.query_transformer.hyde(q) for q in search_queries])
            if use_hyde
            else search_queries
        )

        # 2. Hybrid (dense + BM25) retrieval per transformed query, fused via RRF.
        search_results = await asyncio.gather(
            *[self._search(passage, fetch_limit, query_filter) for passage in search_passages]
        )

        merged: dict = {}
        for results in search_results:
            for point in results:
                if point.id not in merged or point.score > merged[point.id].score:
                    merged[point.id] = point

        # 3. Agentic retry: if retrieval came back thin, step back to a broader question and widen the search.
        retried = False
        if len(merged) < min_hits_before_retry:
            retried = True
            step_back_query = await self.query_transformer.step_back(query)
            retry_results = await self._search(step_back_query, fetch_limit, None)
            for point in retry_results:
                if point.id not in merged:
                    merged[point.id] = point

        candidates = sorted(merged.values(), key=lambda c: c.score, reverse=True)

        get_client().update_current_span(
            metadata={
                "num_sub_queries": len(search_queries),
                "num_candidates": len(candidates),
                "agentic_retry_triggered": retried,
            }
        )

        if not candidates:
            return []

        # 4. Cross-encoder rerank against the original (untransformed) query.
        documents = [c.payload.get("text", "") for c in candidates]
        ranked = self.reranker.rerank(query=query, documents=documents, top_n=top_k)

        return [
            RetrievedChunk(
                id=candidates[idx].id,
                # Prefer the cross-encoder relevance score; fall back to the fusion score
                # when no reranker is configured.
                score=rerank_score if rerank_score is not None else candidates[idx].score,
                payload=candidates[idx].payload,
            )
            for idx, rerank_score in ranked
        ]
