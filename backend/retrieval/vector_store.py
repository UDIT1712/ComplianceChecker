from langfuse import get_client, observe
from qdrant_client import QdrantClient, models
from backend.config import settings


class VectorStore:
    DENSE_VECTOR_NAME = "dense"
    SPARSE_VECTOR_NAME = "bm25"
    DENSE_VECTOR_SIZE = 1536

    def __init__(self):
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.collection_name = settings.COLLECTION_NAME

    def init_collection(self):
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config={
                    self.DENSE_VECTOR_NAME: models.VectorParams(
                        size=self.DENSE_VECTOR_SIZE, distance=models.Distance.COSINE
                    ),
                },
                sparse_vectors_config={
                    self.SPARSE_VECTOR_NAME: models.SparseVectorParams(
                        modifier=models.Modifier.IDF,
                    ),
                },
            )

    def upsert(
        self,
        ids: list[str],
        dense_vectors: list[list[float]],
        sparse_vectors: list[dict],
        payloads: list[dict],
    ):
        points = [
            models.PointStruct(
                id=id_,
                vector={
                    self.DENSE_VECTOR_NAME: dense_vector,
                    self.SPARSE_VECTOR_NAME: models.SparseVector(
                        indices=sparse_vector["indices"], values=sparse_vector["values"]
                    ),
                },
                payload=payload,
            )
            for id_, dense_vector, sparse_vector, payload in zip(ids, dense_vectors, sparse_vectors, payloads)
        ]
        self.client.upsert(collection_name=self.collection_name, points=points)

    def build_filter(self, jurisdiction: str = None, doc_type: str = None) -> models.Filter | None:
        conditions = []
        if jurisdiction:
            conditions.append(
                models.FieldCondition(key="jurisdiction", match=models.MatchValue(value=jurisdiction))
            )
        if doc_type:
            conditions.append(
                models.FieldCondition(key="doc_type", match=models.MatchValue(value=doc_type))
            )
        return models.Filter(must=conditions) if conditions else None

    @observe(name="qdrant_hybrid_search", as_type="retriever", capture_output=False)
    def hybrid_search(
        self,
        dense_vector: list[float],
        sparse_vector: dict,
        limit: int = 5,
        query_filter: models.Filter = None,
        prefetch_limit: int = 20,
    ) -> list[models.ScoredPoint]:
        response = self.client.query_points(
            collection_name=self.collection_name,
            prefetch=[
                models.Prefetch(
                    query=dense_vector,
                    using=self.DENSE_VECTOR_NAME,
                    limit=prefetch_limit,
                    filter=query_filter,
                ),
                models.Prefetch(
                    query=models.SparseVector(indices=sparse_vector["indices"], values=sparse_vector["values"]),
                    using=self.SPARSE_VECTOR_NAME,
                    limit=prefetch_limit,
                    filter=query_filter,
                ),
            ],
            query=models.FusionQuery(fusion=models.Fusion.RRF),
            query_filter=query_filter,
            limit=limit,
        )
        get_client().update_current_span(
            metadata={
                "num_results": len(response.points),
                "limit": limit,
                "prefetch_limit": prefetch_limit,
                "has_filter": query_filter is not None,
                "top_score": response.points[0].score if response.points else None,
            }
        )
        return response.points
