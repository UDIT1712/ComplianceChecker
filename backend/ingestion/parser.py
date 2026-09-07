import fitz
import docx
from bs4 import BeautifulSoup
from pathlib import Path
from typing import Dict, Any

class DocumentParser:
    PARSERS_BY_EXTENSION = {".pdf": "parse_pdf", ".docx": "parse_docx", ".html": "parse_html"}

    def parse(self, file_path: str) -> Dict[str, Any]:
        ext = Path(file_path).suffix.lower()
        method_name = self.PARSERS_BY_EXTENSION.get(ext)
        if method_name is None:
            raise ValueError(f"Unsupported file type: {ext or 'unknown'}")
        return getattr(self, method_name)(file_path)

    def parse_pdf(self, file_path: str) -> Dict[str, Any]:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return {"text": text, "metadata": {"source": file_path, "type": "pdf"}}
        
    def parse_docx(self, file_path: str) -> Dict[str, Any]:
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return {"text": text, "metadata": {"source": file_path, "type": "docx"}}
        
    def parse_html(self, file_path: str) -> Dict[str, Any]:
        with open(file_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")
        text = soup.get_text(separator="\n", strip=True)
        return {"text": text, "metadata": {"source": file_path, "type": "html"}}
