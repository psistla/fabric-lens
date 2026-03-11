interface Props {
  state: string;
}

export function StateBadge({ state }: Props) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
        state === 'Active'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
      }`}
    >
      {state}
    </span>
  );
}
