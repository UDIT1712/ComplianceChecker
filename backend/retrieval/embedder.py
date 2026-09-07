from langchain_openai import OpenAIEmbeddings
from langfuse import get_client, observe

from backend.config import settings

class Embedder:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            openai_api_key=settings.OPENAI_API_KEY
        )

    @observe(name="embed_documents", as_type="embedding", capture_output=False)
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        vectors = self.embeddings.embed_documents(texts)
        get_client().update_current_generation(
            model=settings.EMBEDDING_MODEL,
            metadata={"num_texts": len(texts)},
        )
        return vectors

    @observe(name="embed_query", as_type="embedding", capture_output=False)
    def embed_query(self, text: str) -> list[float]:
        vector = self.embeddings.embed_query(text)
        get_client().update_current_generation(model=settings.EMBEDDING_MODEL)
        return vector
