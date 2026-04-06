import { Info, Lock, Unlock } from 'lucide-react';

export function LimitedAccessPanel() {
  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <Info className="h-5 w-5 text-[var(--m-primary)] shrink-0" />
        <h2 className="text-base font-semibold text-[var(--m-text)]">Limited Access Mode</h2>
      </div>
      <p className="text-sm text-[var(--m-text-secondary)] mb-6">
        Your account does not have the Fabric Administrator role. The data below reflects
        what is available via user-scoped APIs.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Available now */}
        <div className="rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Unlock className="h-4 w-4 text-[var(--m-success)]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">
              Available now
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-[var(--m-text)]">
            <li>Workspace inventory</li>
            <li>Health scores and grade distribution</li>
            <li>Capacity assignment view</li>
            <li>Item counts by type</li>
          </ul>
        </div>

        {/* Requires admin */}
        <div className="rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-4 w-4 text-[var(--m-text-secondary)]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">
              Requires Fabric Admin role
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-[var(--m-text-secondary)]">
            <li>Security scan (access assignments, SPOF, SPN governance)</li>
            <li>Tenant settings risk</li>
            <li>Widely shared objects</li>
            <li>Ghost workspace detection</li>
          </ul>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--m-border)]">
        <a
          href="https://learn.microsoft.com/en-us/fabric/admin/microsoft-fabric-admin#assign-microsoft-fabric-admin"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--m-primary)] hover:underline"
        >
          How to request Fabric Administrator role
        </a>
      </div>
    </div>
  );
}
