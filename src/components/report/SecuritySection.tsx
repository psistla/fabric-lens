import type { ReportData } from '@/utils/reportData';

interface Props {
  securityPosture: ReportData['securityPosture'];
}

export function SecuritySection({ securityPosture }: Props) {
  return (
    <section className="bg-[var(--m-surface)] px-10 py-8 border-b border-[var(--m-border)] mt-0.5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)] mb-4">
        Security Posture
      </h2>
      {securityPosture === null ? (
        <p className="text-sm text-[var(--m-text-secondary)] italic">
          Security scan required. Visit the Security page to run a scan.
        </p>
      ) : (
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-[var(--m-text)]">{securityPosture.score}</span>
            <span className="text-lg text-[var(--m-text-secondary)]">/ 100</span>
            <span className="ml-2 text-base font-semibold text-[var(--m-text-secondary)]">
              Grade {securityPosture.grade}
            </span>
          </div>
          {securityPosture.checks.length > 0 && (
            <table className="w-full text-sm border-collapse">
              <tbody>
                {securityPosture.checks.map((check, i) => (
                  <tr key={i} className="border-b border-[var(--m-border)]">
                    <td className="py-1.5 text-[var(--m-text)]">{check.label}</td>
                    <td className="py-1.5 text-right font-medium text-[var(--m-text-secondary)]">
                      {check.earned} / {check.max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
