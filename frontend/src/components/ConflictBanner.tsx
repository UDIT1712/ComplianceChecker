import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { ConflictInfo } from '../types';

export function ConflictBanner({ conflict }: { conflict: ConflictInfo }) {
  if (!conflict.has_conflict) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 dark:border-amber-500/30 dark:bg-amber-500/10"
    >
      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="text-[13px] leading-relaxed text-amber-800 dark:text-amber-300">
        <span className="font-semibold">Potential conflict — </span>
        {conflict.conflict_description || 'The retrieved sources do not fully agree.'}
      </p>
    </motion.div>
  );
}
