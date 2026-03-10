import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  function handleChange(next: string) {
    setLocal(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), SEARCH_DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
      />
      {local && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
