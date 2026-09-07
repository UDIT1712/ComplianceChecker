import logging

from langfuse import Langfuse

from backend.config import settings

logger = logging.getLogger(__name__)

_client: Langfuse | None = None


def init_langfuse() -> Langfuse:
    """Initialize the process-wide Langfuse client.

    Must run before any @observe-decorated code executes so that this instance
    becomes the default client picked up by langfuse.get_client()/@observe.
    If no keys are configured, tracing is disabled and @observe becomes a no-op,
    so the app runs fine without a Langfuse account.
    """
    global _client
    if _client is not None:
        return _client

    if settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY:
        _client = Langfuse(
            public_key=settings.LANGFUSE_PUBLIC_KEY,
            secret_key=settings.LANGFUSE_SECRET_KEY,
            host=settings.LANGFUSE_HOST,
        )
        logger.info("Langfuse tracing enabled (host=%s)", settings.LANGFUSE_HOST)
    else:
        _client = Langfuse(tracing_enabled=False, public_key="disabled", secret_key="disabled")
        logger.info("Langfuse tracing disabled: no LANGFUSE_PUBLIC_KEY/LANGFUSE_SECRET_KEY set")

    return _client


def shutdown_langfuse():
    if _client is not None:
        _client.flush()
        _client.shutdown()
