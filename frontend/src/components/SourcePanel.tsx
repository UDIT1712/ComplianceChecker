import { useEffect, useRef } from 'react';
import { Citation } from '../types';
import { CitationCard } from './CitationCard';

interface SourcePanelProps {
  citations: Citation[];
  activeCitation: number | null;
  onSelect: (index: number) => void;
}

export function SourcePanel({ citations, activeCitation, onSelect }: SourcePanelProps) {
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeCitation == null) return;
    cardRefs.current[activeCitation]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeCitation]);

  if (citations.length === 0) return null;

  return (
    <div className="flex h-full w-[380px] flex-shrink-0 flex-col gap-3.5 overflow-y-auto border-l border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-[#0d1729]">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Sources
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-600">{citations.length} matched</span>
      </div>

      {citations.map((citation, i) => {
        const index = i + 1;
        return (
          <CitationCard
            key={`${citation.document_id}-${index}`}
            ref={(el) => (cardRefs.current[index] = el)}
            citation={citation}
            index={index}
            active={activeCitation === index}
            onSelect={() => onSelect(index)}
          />
        );
      })}
    </div>
  );
}
