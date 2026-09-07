import json

from langfuse import observe

from backend.generation.llm_client import LLMClient

HYDE_PROMPT = """Write a short hypothetical passage (3-5 sentences) that would directly answer the \
following legal/compliance question. Do not hedge or mention uncertainty; write as if it were an \
excerpt from an authoritative regulation, contract, or policy document.

Question: {query}

Passage:"""

DECOMPOSE_PROMPT = """Break the following legal/compliance question into 2-4 simpler, self-contained \
sub-questions that together cover what is needed to answer it. If the question is already simple, \
return it unchanged as the only item.

Question: {query}

Respond with a JSON array of strings, and nothing else."""

STEP_BACK_PROMPT = """Given the following specific legal/compliance question, write a single more \
general "step-back" question about the broader rule or principle it depends on.

Question: {query}

Step-back question:"""


class QueryTransformer:
    def __init__(self):
        self.llm_client = LLMClient()

    @observe(name="query_transform_hyde", as_type="span")
    async def hyde(self, query: str) -> str:
        return await self.llm_client.agenerate(HYDE_PROMPT.format(query=query))

    @observe(name="query_transform_decompose", as_type="span")
    async def decompose(self, query: str) -> list[str]:
        raw = await self.llm_client.agenerate(DECOMPOSE_PROMPT.format(query=query))
        try:
            sub_questions = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return [query]

        if isinstance(sub_questions, list) and sub_questions:
            return [str(q) for q in sub_questions]
        return [query]

    @observe(name="query_transform_step_back", as_type="span")
    async def step_back(self, query: str) -> str:
        return await self.llm_client.agenerate(STEP_BACK_PROMPT.format(query=query))
