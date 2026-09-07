import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';
import { Citation } from '../types';

interface CitationCardProps {
  citation: Citation;
  index: number;
  active: boolean;
  onSelect: () => void;
}

export const CitationCard = forwardRef<HTMLDivElement, CitationCardProps>(
  ({ citation, index, active, onSelect }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
        onClick={onSelect}
        className={`relative cursor-pointer rounded-xl border p-3.5 transition-colors ${
          active
            ? 'border-accent/60 bg-accent/5 dark:bg-accent/10 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700'
        }`}
      >
        {active && (
          <motion.div
            layoutId="active-source-indicator"
            className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl bg-accent"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}

        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-bold ${
                active
                  ? 'bg-accent/20 text-accent dark:text-sky-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {index}
            </span>
            <FileText size={13} className="flex-shrink-0 text-slate-400 dark:text-slate-500" />
            <span
              className="truncate text-[12.5px] font-semibold text-slate-800 dark:text-slate-100"
              title={citation.document_name}
            >
              {citation.document_name}
            </span>
          </div>
          <span className="flex-shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            {Math.round(citation.score * 100)}%
          </span>
        </div>

        {citation.section && (
          <div className="mb-1.5 font-mono text-[10.5px] text-slate-500 dark:text-slate-500">{citation.section}</div>
        )}

        <div className="line-clamp-3 text-[12px] leading-relaxed text-slate-600 dark:text-slate-400">
          "{citation.text_snippet}"
        </div>
      </motion.div>
    );
  }
);
CitationCard.displayName = 'CitationCard';
