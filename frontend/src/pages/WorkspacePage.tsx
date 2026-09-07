import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { QueryBar } from '../components/QueryBar';
import { PipelineTrace } from '../components/PipelineTrace';
import { BriefCard } from '../components/BriefCard';
import { SourcePanel } from '../components/SourcePanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { QueryResponse } from '../types';

const JURISDICTIONS = ['EU', 'US'];
const DOC_TYPES = ['contract', 'regulation', 'policy'];

const STARTER_PROMPTS = [
  'Summarize GDPR Art. 28 sub-processor obligations',
  'Compare US vs EU breach notification windows',
  'Is our data retention policy still compliant?',
];

export function WorkspacePage() {
  const [input, setInput] = useState('');
  const [askedQuery, setAskedQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [docType, setDocType] = useState('');
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const [result, setResult] = useState<QueryResponse | null>(null);

  const queryMutation = useMutation({
    mutationFn: api.query,
    onSuccess: (data) => {
      setResult(data);
      setActiveCitation(null);
    },
  });

  const runQuery = (question: string) => {
    if (!question.trim() || queryMutation.isPending) return;
    setAskedQuery(question);
    setInput(question);
    setResult(null);
    queryMutation.mutate({
      query: question,
      jurisdiction_filter: jurisdiction || undefined,
      doc_type_filter: docType || undefined,
    });
  };

  const hasAsked = askedQuery.length > 0;
  const traceStatus = queryMutation.isPending ? 'pending' : queryMutation.isError ? 'error' : 'done';

  return (
    <div className="flex h-full min-h-0 flex-col bg-light-surface dark:bg-[#0b1526]">
      {/* topbar */}
      <div className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-200 px-7 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="text-slate-500 dark:text-slate-500">Workspace</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="max-w-[420px] truncate font-semibold text-slate-800 dark:text-slate-100">
            {hasAsked ? askedQuery : 'New Research'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary outline-none dark:border-[#1e3a5f] dark:bg-[#1e3a5f]/40 dark:text-blue-300"
          >
            <option value="">Jurisdiction: All</option>
            {JURISDICTIONS.map((j) => (
              <option key={j} value={j}>
                Jurisdiction: {j}
              </option>
            ))}
          </select>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium capitalize text-primary outline-none dark:border-[#1e3a5f] dark:bg-[#1e3a5f]/40 dark:text-blue-300"
          >
            <option value="">Type: All</option>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                Type: {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-7">
          <QueryBar value={input} onChange={setInput} onSubmit={() => runQuery(input)} disabled={queryMutation.isPending} />

          {!hasAsked && (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 pb-16 text-center">
              <div>
                <h2 className="mb-1.5 text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Ask your first compliance question
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Answers cite the exact source passages on the right, with a confidence score and any conflicts flagged.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => runQuery(p)}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-slate-800 dark:bg-[#111d33] dark:text-slate-400"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasAsked && <PipelineTrace status={traceStatus} />}

          <AnimatePresence mode="wait">
            {queryMutation.isPending && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSpinner />
              </motion.div>
            )}

            {queryMutation.isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                Something went wrong processing that question. Please try again.
              </motion.div>
            )}

            {result && !queryMutation.isPending && (
              <motion.div key="result">
                <BriefCard result={result} activeCitation={activeCitation} onCitationSelect={setActiveCitation} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {result && !queryMutation.isPending && (
          <SourcePanel citations={result.citations} activeCitation={activeCitation} onSelect={setActiveCitation} />
        )}
      </div>
    </div>
  );
}
