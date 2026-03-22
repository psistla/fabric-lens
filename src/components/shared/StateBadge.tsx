interface Props {
  state: string;
}

export function StateBadge({ state }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        state === 'Active'
          ? 'bg-[var(--m-success-bg)] text-[var(--m-success-text)]'
          : 'bg-[var(--m-surface)] text-[var(--m-text-secondary)]'
      }`}
    >
      {state}
    </span>
  );
}
