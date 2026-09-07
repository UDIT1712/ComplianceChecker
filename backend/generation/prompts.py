from langchain.prompts import PromptTemplate

SYSTEM_PROMPT = """You are an Enterprise Multi-Source Legal/Compliance RAG Assistant.
You provide accurate answers based on the provided context."""

RAG_PROMPT_TEMPLATE = """
Numbered sources:
{context}

Question:
{question}

Answer the question using only the numbered sources above. Cite the source number(s) inline,
immediately after the claim they support, e.g. "...requires audit rights [1]." Cite every
factual claim. If two sources conflict with each other, say so explicitly in the answer and
also flag it in "conflicts" below.

Respond with JSON only, with exactly these keys:
- "answer": the answer text, with inline [n] citations as described above
- "confidence_score": a number from 0 to 1 for how well the sources support the answer
- "conflicts": null, or an object {{"has_conflict": true, "conflict_description": "..."}} if two
  or more sources contradict each other
"""

rag_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=RAG_PROMPT_TEMPLATE
)
