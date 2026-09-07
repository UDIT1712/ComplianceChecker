import { Document } from '../types';
import { FileText, Calendar, MapPin, Hash, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function DocumentCard({ document: doc }: { document: Document }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-slate-800 p-2 rounded-lg text-primary dark:text-blue-400">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1" title={doc.name}>
              {doc.name}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {doc.type}
            </span>
          </div>
        </div>
        <div>
          {doc.status === 'Ready' && <CheckCircle2 className="text-green-500" size={20} />}
          {doc.status === 'Processing' && <Clock className="text-amber-500 animate-pulse" size={20} />}
          {doc.status === 'Error' && <AlertCircle className="text-red-500" size={20} />}
        </div>
      </div>
      
      <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {doc.jurisdiction && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin size={14} />
            <span>{doc.jurisdiction}</span>
          </div>
        )}
        {doc.date && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Calendar size={14} />
            <span>{doc.date}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Hash size={14} />
          <span>{doc.chunk_count} chunks extracted</span>
        </div>
      </div>
    </div>
  );
}
