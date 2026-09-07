from langchain_openai import ChatOpenAI
from langfuse import get_client, observe

from backend.config import settings


class LLMClient:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=0
        )

    @observe(name="llm_generate", as_type="generation")
    async def agenerate(self, prompt: str):
        response = await self.llm.ainvoke(prompt)

        usage = getattr(response, "usage_metadata", None)
        get_client().update_current_generation(
            model=settings.LLM_MODEL,
            model_parameters={"temperature": 0},
            output=response.content,
            usage_details={
                "input": usage.get("input_tokens", 0),
                "output": usage.get("output_tokens", 0),
                "total": usage.get("total_tokens", 0),
            } if usage else None,
        )
        return response.content
