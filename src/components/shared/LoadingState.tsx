interface Props {
  rows?: number;
}

export function LoadingState({ rows = 4 }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div
            className="h-4 animate-pulse rounded bg-[var(--surface-secondary)]"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
          <div
            className="h-4 animate-pulse rounded bg-[var(--surface-secondary)]"
            style={{ width: `${20 + Math.random() * 20}%` }}
          />
        </div>
      ))}
    </div>
  );
}
