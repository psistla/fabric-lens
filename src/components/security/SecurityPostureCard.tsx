import { ScoreRing } from '@/components/dashboard/ScoreRing';
import type { SecurityPosture } from '@/utils/securityFindings';

interface Props {
  posture: SecurityPosture;
}

const GRADE_DESCRIPTIONS: Record<string, string> = {
  A: 'Excellent — access is well-governed',
  B: 'Good — minor gaps to address',
  C: 'Fair — several risks need attention',
  D: 'Poor — significant exposure present',
  F: 'Critical — immediate remediation needed',
};

function CheckRow({
  label,
  earned,
  max,
  status,
}: {
  label: string;
  earned: number;
  max: number;
  status: string;
}) {
  const passed = earned === max;
  const partial = earned > 0 && earned < max;
  const failed = earned === 0;

  const dotColor = passed
    ? 'bg-[var(--m-success)]'
    : partial
      ? 'bg-[var(--m-warning)]'
      : 'bg-[var(--m-error)]';

  const pointsColor = passed
    ? 'text-[var(--m-success)]'
    : partial
      ? 'text-[var(--m-warning)]'
      : 'text-[var(--m-error)]';

  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[var(--m-text)]">{label}</p>
        <p className="text-[11px] text-[var(--m-text-secondary)]">{status}</p>
      </div>
      <span className={`shrink-0 font-mono text-[11px] font-semibold tabular-nums ${pointsColor}`}>
        {failed ? '0' : `+${earned}`}
        <span className="font-normal text-[var(--m-text-tertiary)]">/{max}</span>
      </span>
    </div>
  );
}

export function SecurityPostureCard({ posture }: Props) {
  const description = GRADE_DESCRIPTIONS[posture.grade] ?? '';

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
      <div className="flex items-start gap-6">
        {/* Score ring */}
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <ScoreRing score={posture.score} grade={posture.grade} size={88} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
            Posture
          </p>
        </div>

        {/* Check breakdown */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-baseline gap-2">
            <h2 className="text-sm font-medium text-[var(--m-text)]">Security Posture</h2>
            <p className="text-xs text-[var(--m-text-secondary)]">{description}</p>
          </div>

          <div className="divide-y divide-[var(--m-border)]">
            {posture.checks.map((check) => (
              <CheckRow
                key={check.id}
                label={check.label}
                earned={check.earned}
                max={check.max}
                status={check.status}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
