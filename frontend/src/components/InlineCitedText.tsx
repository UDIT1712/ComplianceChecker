interface InlineCitedTextProps {
  text: string;
  citationCount: number;
  activeCitation: number | null;
  onCitationSelect: (index: number) => void;
}

const CITATION_PATTERN = /(\[\d+\])/g;

export function InlineCitedText({ text, citationCount, activeCitation, onCitationSelect }: InlineCitedTextProps) {
  const paragraphs = text.trim().split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, pIdx) => (
        <p key={pIdx} className="text-[14.5px] leading-[1.75] text-slate-700 dark:text-slate-300">
          {paragraph.split(CITATION_PATTERN).map((segment, sIdx) => {
            const match = segment.match(/^\[(\d+)\]$/);
            if (!match) return <span key={sIdx}>{segment}</span>;

            const n = parseInt(match[1], 10);
            if (n < 1 || n > citationCount) return <span key={sIdx}>{segment}</span>;

            const isActive = activeCitation === n;
            return (
              <button
                key={sIdx}
                onClick={() => onCitationSelect(n)}
                className={`mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded px-1 align-text-top text-[10.5px] font-bold transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-accent/15 text-accent hover:bg-accent/25 dark:text-sky-300'
                }`}
              >
                {n}
              </button>
            );
          })}
        </p>
      ))}
    </div>
  );
}
