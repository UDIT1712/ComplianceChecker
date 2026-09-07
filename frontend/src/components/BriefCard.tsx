import { motion } from 'motion/react';
import { QueryResponse } from '../types';
import { ConfidenceRing } from './ConfidenceRing';
import { ConflictBanner } from './ConflictBanner';
import { InlineCitedText } from './InlineCitedText';

interface BriefCardProps {
  result: QueryResponse;
  activeCitation: number | null;
  onCitationSelect: (index: number) => void;
}

export function BriefCard({ result, activeCitation, onCitationSelect }: BriefCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#101c30]"
    >
      <div className="mb-3.5 flex items-start justify-between gap-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Brief
        </span>
        <ConfidenceRing score={result.confidence_score} />
      </div>

      {result.conflicts?.has_conflict && (
        <div className="mb-4">
          <ConflictBanner conflict={result.conflicts} />
        </div>
      )}

      <InlineCitedText
        text={result.answer}
        citationCount={result.citations.length}
        activeCitation={activeCitation}
        onCitationSelect={onCitationSelect}
      />
    </motion.div>
  );
}
