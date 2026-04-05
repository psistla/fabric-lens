import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { RiskyTenantSetting } from '@/api/types/tenantSettings';
import { FABRIC_ADMIN_PORTAL_SETTINGS_URL } from '@/utils/constants';

interface Props {
  settings: RiskyTenantSetting[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function humanise(settingName: string): string {
  return settingName.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function scopeLabel(enabledSecurityGroups: RiskyTenantSetting['enabledSecurityGroups']): string {
  return enabledSecurityGroups.length === 0
    ? 'All users'
    : `${enabledSecurityGroups.length} group${enabledSecurityGroups.length > 1 ? 's' : ''}`;
}

export function TenantSettingsRiskPanel({ settings, loading, error, onRetry }: Props) {
  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <ShieldAlert className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Tenant Settings Risk
          </h2>
        </div>
        <div className="divide-y divide-[var(--m-border)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="m-skeleton h-4 w-48" />
              <div className="m-skeleton h-4 w-32" />
              <div className="m-skeleton h-5 w-16 rounded-full" />
              <div className="m-skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <ShieldAlert className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Tenant Settings Risk
          </h2>
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[var(--m-warning-text)]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--m-warning)]" />
            Tenant settings unavailable — check admin permissions
          </div>
          <button
            onClick={onRetry}
            className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-[var(--m-primary)] ring-1 ring-[var(--m-primary)]/40 transition-colors hover:bg-[var(--m-primary-subtle)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (settings.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <ShieldAlert className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Tenant Settings Risk
          </h2>
        </div>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ShieldCheck className="h-7 w-7 text-[var(--m-success)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">
            No high or medium risk settings are currently enabled.
          </p>
          <p className="text-xs text-[var(--m-text-secondary)]">
            No tenant-level configuration risks detected.
          </p>
        </div>
      </div>
    );
  }

  const highCount = settings.filter((s) => s.riskLevel === 'high').length;
  const mediumCount = settings.filter((s) => s.riskLevel === 'medium').length;

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[var(--m-error)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Tenant Settings Risk
          </h2>
        </div>
        <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
          {highCount} high · {mediumCount} medium
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Setting
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Group
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Risk
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Scope
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--m-border)]">
            {settings.map((s) => (
              <tr key={s.settingName} className="hover:bg-[var(--m-surface-hover)]">
                <td className="px-4 py-2.5">
                  <span className="font-medium text-[var(--m-text)]">
                    {humanise(s.settingName)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                  {s.tenantSettingGroup}
                </td>
                <td className="px-4 py-2.5">
                  {s.riskLevel === 'high' ? (
                    <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-error-text)]">
                      High
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--m-accent-subtle)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-accent)]">
                      Medium
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                  {scopeLabel(s.enabledSecurityGroups)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[11px] text-[var(--m-text-tertiary)]">
        <span>
          Review these settings in the Fabric Admin Portal to determine if they should be
          restricted to specific security groups.
        </span>
        <a
          href={FABRIC_ADMIN_PORTAL_SETTINGS_URL}
          target="_blank"
          rel="noreferrer"
          className="ml-4 shrink-0 text-[var(--m-primary)] hover:underline"
        >
          Open Admin Portal
        </a>
      </div>
    </div>
  );
}
