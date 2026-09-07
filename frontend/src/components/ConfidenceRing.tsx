import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function ConfidenceRing({ score }: { score: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  const [display, setDisplay] = useState(0);

  const tier =
    score >= 0.8
      ? { stroke: '#22c55e', text: 'text-green-600 dark:text-green-400', label: 'High' }
      : score >= 0.5
      ? { stroke: '#f59e0b', text: 'text-amber-600 dark:text-amber-400', label: 'Medium' }
      : { stroke: '#ef4444', text: 'text-red-600 dark:text-red-400', label: 'Low' };

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const start = performance.now();
      const duration = 900;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setDisplay(Math.round(pct * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  return (
    <div className="flex flex-col items-center gap-1" title={`${tier.label} confidence`}>
      <div className="relative w-14 h-14">
        <svg width="56" height="56" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" strokeWidth="5" className="stroke-slate-200 dark:stroke-slate-700" />
          <motion.circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke={tier.stroke}
            strokeWidth="5"
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ pathLength: 0 }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pct / 100 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white">
          {display}%
        </div>
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${tier.text}`}>{tier.label}</span>
    </div>
  );
}
