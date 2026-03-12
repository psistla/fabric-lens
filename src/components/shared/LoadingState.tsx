interface Props {
  rows?: number;
}

// Deterministic widths to avoid impure Math.random() during render
const ROW_WIDTHS = [
  { left: '75%', right: '30%' },
  { left: '65%', right: '25%' },
  { left: '80%', right: '35%' },
  { left: '70%', right: '20%' },
  { left: '85%', right: '28%' },
  { left: '60%', right: '32%' },
];

export function LoadingState({ rows = 4 }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => {
        const widths = ROW_WIDTHS[i % ROW_WIDTHS.length];
        return (
          <div key={i} className="flex gap-4">
            <div
              className="h-4 animate-pulse rounded bg-[var(--surface-secondary)]"
              style={{ width: widths.left }}
            />
            <div
              className="h-4 animate-pulse rounded bg-[var(--surface-secondary)]"
              style={{ width: widths.right }}
            />
          </div>
        );
      })}
    </div>
  );
}
