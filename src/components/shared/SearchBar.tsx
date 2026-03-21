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
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--m-text-tertiary)]" />
      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] pl-9 pr-8 text-sm text-[var(--m-text)] placeholder:text-[var(--m-text-tertiary)] focus:border-[var(--m-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--m-primary)] focus:ring-offset-2"
      />
      {local && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[var(--m-text-tertiary)] hover:text-[var(--m-text-secondary)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
