import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

const STAGES = ['Decompose', 'Hybrid Search', 'Rerank', 'Generate'];

type TraceStatus = 'pending' | 'done' | 'error';

export function PipelineTrace({ status }: { status: TraceStatus }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (status !== 'pending') {
      clearInterval(intervalRef.current);
      return;
    }
    setActiveIndex(0);
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % STAGES.length);
    }, 750);
    return () => clearInterval(intervalRef.current);
  }, [status]);

  return (
    <div className="flex items-center gap-3.5 px-1">
      <span className="flex-shrink-0 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
        Trace
      </span>
      <div className="flex flex-1 items-center">
        {STAGES.map((stage, i) => {
          const isLast = stage === 'Generate';
          const isDone = status === 'done';
          const isError = status === 'error' && isLast;
          const isActive = status === 'pending' && i === activeIndex;
          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={isActive ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                  transition={isActive ? { duration: 0.75, repeat: Infinity } : {}}
                  className={`h-[7px] w-[7px] rounded-full ${
                    isError
                      ? 'bg-red-500'
                      : isDone
                      ? 'bg-green-500'
                      : isActive
                      ? 'bg-accent'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
                <span
                  className={`text-[12px] ${
                    isError
                      ? 'font-medium text-red-500 dark:text-red-400'
                      : isDone
                      ? 'font-medium text-slate-600 dark:text-slate-300'
                      : isActive
                      ? 'font-medium text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {isLast && isDone ? 'Generated' : isLast && isError ? 'Failed' : stage}
                </span>
                {isLast && isDone && <Check size={13} className="text-green-500" />}
                {isLast && isError && <X size={13} className="text-red-500" />}
              </div>
              {i < STAGES.length - 1 && (
                <div className="mx-3 h-px max-w-[48px] flex-1 bg-slate-200 dark:bg-slate-800" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
