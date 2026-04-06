interface Props {
  summary: string;
}

export function ExecutiveSummarySection({ summary }: Props) {
  return (
    <section className="bg-[var(--m-surface)] px-10 py-8 border-b border-[var(--m-border)] mt-0.5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)] mb-4">
        Executive Summary
      </h2>
      <p className="text-base leading-relaxed text-[var(--m-text)] italic border-l-4 border-[var(--m-primary)] pl-4">
        {summary}
      </p>
    </section>
  );
}
