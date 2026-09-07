import { FormEvent, useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface QueryBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function QueryBar({ value, onChange, onSubmit, disabled }: QueryBarProps) {
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 transition-shadow dark:bg-[#111d33] ${
        focused
          ? 'border-accent/60 shadow-[0_0_0_3px_rgba(56,189,248,0.15)]'
          : 'border-slate-200 dark:border-[#1e3a5f]'
      }`}
    >
      <Search size={18} className="flex-shrink-0 text-accent" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Ask a compliance question…"
        className="flex-1 bg-transparent text-[14.5px] text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[12.5px] font-bold text-[#08111f] transition-opacity disabled:opacity-40"
      >
        Ask
        <ArrowRight size={13} strokeWidth={2.5} />
      </button>
    </form>
  );
}
