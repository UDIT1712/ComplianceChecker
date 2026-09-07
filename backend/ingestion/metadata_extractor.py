import re
from typing import Dict, Any

class MetadataExtractor:
    def extract(self, text: str) -> Dict[str, Any]:
        metadata = {}
        
        # Basic document type extraction
        lower_text = text.lower()
        if "contract" in lower_text or "agreement" in lower_text:
            metadata["doc_type"] = "contract"
        elif "regulation" in lower_text or "directive" in lower_text:
            metadata["doc_type"] = "regulation"
        else:
            metadata["doc_type"] = "policy"
            
        # Basic date extraction
        date_pattern = r'\b(?:\d{1,2}[-/th|st|nd|rd\s]*)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[a-z\s,.]*\d{4}\b'
        dates = re.findall(date_pattern, text)
        if dates:
            metadata["dates"] = dates
            
        # Jurisdiction extraction
        if "european union" in lower_text or "gdpr" in lower_text:
            metadata["jurisdiction"] = "EU"
        elif "united states" in lower_text or " us " in lower_text:
            metadata["jurisdiction"] = "US"
        else:
            metadata["jurisdiction"] = "Unknown"
            
        return metadata
