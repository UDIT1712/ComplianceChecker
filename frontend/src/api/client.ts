import axios from 'axios';
import { QueryRequest, QueryResponse, Document } from '../types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  query: async (data: QueryRequest): Promise<QueryResponse> => {
    const response = await apiClient.post('/api/query', data);
    return response.data;
  },
  
  uploadDocument: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getDocuments: async (): Promise<Document[]> => {
    const response = await apiClient.get<{ documents: Document[]; total: number }>('/api/documents');
    return response.data.documents;
  },
};
