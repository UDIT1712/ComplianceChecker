from backend.retrieval.retriever import Retriever
from backend.generation.llm_client import LLMClient
from backend.generation.prompts import rag_prompt, SYSTEM_PROMPT
from langfuse import get_client, observe
import json

class RAGChain:
    def __init__(self):
        self.retriever = Retriever()
        self.llm_client = LLMClient()

    @observe(name="rag_query", as_type="span")
    async def process_query(
        self,
        query: str,
        top_k: int = None,
        jurisdiction: str = None,
        doc_type: str = None,
    ):
        # 1. Retrieve
        results = await self.retriever.retrieve(
            query, top_k=top_k, jurisdiction=jurisdiction, doc_type=doc_type
        )

        # 2. Assemble numbered context + citations (citations come from the retrieved
        # chunks themselves, not from the LLM, so [n] markers always line up correctly
        # and scores are real reranker/retrieval scores).
        with get_client().start_as_current_observation(name="assemble_context", as_type="span") as span:
            context_parts = []
            citations = []
            for i, res in enumerate(results, start=1):
                text = res.payload.get("text", "")
                doc_id = res.payload.get("document_id", "unknown")
                doc_name = res.payload.get("document_name", doc_id)
                section = res.payload.get("section")

                label = f"{doc_name} ({section})" if section else doc_name
                context_parts.append(f"[{i}] {label}: {text}")

                citations.append({
                    "document_id": doc_id,
                    "document_name": doc_name,
                    "section": section,
                    "text_snippet": text[:500],
                    "score": max(0.0, min(1.0, res.score)),
                })

            context = "\n\n".join(context_parts)
            span.update(metadata={"num_chunks": len(results), "context_chars": len(context)})

        # 3. Generate
        prompt = rag_prompt.format(context=context, question=query)
        full_prompt = f"{SYSTEM_PROMPT}\n\n{prompt}"

        response_text = await self.llm_client.agenerate(full_prompt)

        # 4. Post-process (defensively: the LLM's JSON is untrusted input)
        with get_client().start_as_current_observation(name="postprocess", as_type="span") as span:
            parsed_ok = False
            answer = response_text
            confidence_score = 0.5
            conflicts = None

            try:
                parsed = json.loads(response_text)
                answer = str(parsed.get("answer", response_text))
                confidence_score = max(0.0, min(1.0, float(parsed.get("confidence_score", 0.5))))
                raw_conflicts = parsed.get("conflicts")
                if isinstance(raw_conflicts, dict) and "has_conflict" in raw_conflicts:
                    conflicts = raw_conflicts
                parsed_ok = True
            except (json.JSONDecodeError, TypeError, ValueError):
                pass

            response_json = {
                "answer": answer,
                "citations": citations,
                "confidence_score": confidence_score,
                "conflicts": conflicts,
            }
            span.update(output=response_json, metadata={"parsed_as_json": parsed_ok})

        get_client().update_current_span(output=response_json)
        get_client().score_current_trace(
            name="confidence_score",
            value=response_json["confidence_score"],
            data_type="NUMERIC",
        )

        return response_json
