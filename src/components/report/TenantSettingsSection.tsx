import type { ReportData } from '@/utils/reportData';

interface Props {
  riskySettings: ReportData['riskySettings'];
  settingsLoaded: ReportData['settingsLoaded'];
}

export function TenantSettingsSection({ riskySettings, settingsLoaded }: Props) {
  return (
    <section className="bg-[var(--m-surface)] px-10 py-8 border-b border-[var(--m-border)] mt-0.5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)] mb-4">
        Tenant Settings
      </h2>
      {!settingsLoaded ? (
        <p className="text-sm text-[var(--m-text-secondary)] italic">
          Security scan required. Visit the Security page to run a scan.
        </p>
      ) : riskySettings.length === 0 ? (
        <p className="text-sm text-[var(--m-text-secondary)]">No high-risk settings enabled.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--m-border)]">
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Setting</th>
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Group</th>
              <th className="text-left py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">Risk</th>
            </tr>
          </thead>
          <tbody>
            {riskySettings.map((s) => (
              <tr key={s.settingName} className="border-b border-[var(--m-border)]">
                <td className="py-1.5 text-[var(--m-text)]">{s.settingName}</td>
                <td className="py-1.5 text-[var(--m-text-secondary)]">{s.tenantSettingGroup}</td>
                <td className="py-1.5 font-semibold uppercase text-[11px] text-[var(--m-text-secondary)]">{s.riskLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
