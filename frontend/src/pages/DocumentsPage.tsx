import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { FileUpload } from '../components/FileUpload';
import { DocumentCard } from '../components/DocumentCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function DocumentsPage() {
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: api.getDocuments,
  });

  return (
    <div className="h-full max-w-6xl mx-auto overflow-y-auto p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Document Library</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upload and manage compliance documents, regulations, and policies for the RAG system.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upload Document</h2>
        <FileUpload />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Ingested Documents {documents && `(${documents.length})`}
        </h2>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            Failed to load documents. Please ensure the backend is running.
          </div>
        ) : documents?.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            No documents found. Upload your first document above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents?.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
