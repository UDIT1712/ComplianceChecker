export interface Citation {
  document_id: string;
  document_name: string;
  section?: string;
  text_snippet: string;
  score: number;
}

export interface ConflictInfo {
  has_conflict: boolean;
  conflict_description?: string;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
  confidence_score: number;
  conflicts?: ConflictInfo | null;
}

export interface QueryRequest {
  query: string;
  jurisdiction_filter?: string;
  doc_type_filter?: string;
  top_k?: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  jurisdiction?: string;
  date?: string;
  chunk_count: number;
  status: 'Processing' | 'Ready' | 'Error';
}
