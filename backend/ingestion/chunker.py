from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict, Any

class ParentChildChunker:
    def __init__(self, parent_chunk_size=1000, child_chunk_size=250):
        self.parent_splitter = RecursiveCharacterTextSplitter(chunk_size=parent_chunk_size, chunk_overlap=100)
        self.child_splitter = RecursiveCharacterTextSplitter(chunk_size=child_chunk_size, chunk_overlap=25)

    def chunk(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        chunks = []
        parent_docs = self.parent_splitter.create_documents([text], [metadata])
        
        for i, p_doc in enumerate(parent_docs):
            parent_id = f"parent_{i}"
            chunks.append({
                "id": parent_id,
                "text": p_doc.page_content,
                "metadata": p_doc.metadata,
                "is_parent": True
            })
            
            child_docs = self.child_splitter.create_documents([p_doc.page_content], [{"parent_id": parent_id, **p_doc.metadata}])
            for j, c_doc in enumerate(child_docs):
                chunks.append({
                    "id": f"child_{i}_{j}",
                    "text": c_doc.page_content,
                    "metadata": c_doc.metadata,
                    "is_parent": False,
                    "parent_id": parent_id
                })
        return chunks
