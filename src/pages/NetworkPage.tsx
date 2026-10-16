import { useEffect, useMemo, useState } from 'react';
import { Globe, Network, Shield, ShieldCheck, Download } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { useNetworkPolicyStore } from '@/store/networkPolicyStore';
import { useAuth } from '@/auth/useAuth';
import { isEffectiveDemoMode } from '@/auth/AuthProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { exportToCSV } from '@/utils/export';
import {
  summarizeNetwork,
  toNetworkRow,
  type NetworkPosture,
  type NetworkRow,
} from '@/utils/networkPosture';

type Filter = 'all' | NetworkPosture;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'isolated', label: 'Isolated' },
  { id: 'inbound-only', label: 'Inbound only' },
  { id: 'outbound-only', label: 'Outbound only' },
  { id: 'open', label: 'Open' },
];

const POSTURE_LABEL: Record<NetworkPosture, string> = {
  isolated: 'Isolated',
  'inbound-only': 'Inbound only',
  'outbound-only': 'Outbound only',
  open: 'Open',
};

const blockLabel = (blocked: boolean) => (blocked ? 'Blocked' : 'Allowed');

const columns: Column<NetworkRow>[] = [
  { key: 'workspaceName', header: 'Workspace', sortable: true },
  {
    key: 'posture',
    header: 'Posture',
    sortable: true,
    render: (v) => POSTURE_LABEL[v as NetworkPosture],
  },
  {
    key: 'inboundDenied',
    header: 'Inbound public access',
    render: (v) => blockLabel(v as boolean),
  },
  {
    key: 'outboundDenied',
    header: 'Outbound public access',
    render: (v) => blockLabel(v as boolean),
  },
  { key: 'firewallRules', header: 'IP firewall rules', sortable: true },
  { key: 'privateEndpoints', header: 'Managed private endpoints', sortable: true },
  {
    key: 'gitAllowedUnderDeny',
    header: 'Note',
    render: (v) => (v ? 'Git still allowed' : ''),
  },
];

export function NetworkPage() {
  useDocumentTitle('Network');
  const { hasAdminAccess, checkAdminConsent, requestAdminConsent } = useAuth();
  const { items, loading, error, fetch } = useNetworkPolicyStore();
  const demo = isEffectiveDemoMode();

  const [consentChecked, setConsentChecked] = useState(demo);
  const [granting, setGranting] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (demo) {
      void fetch();
      return;
    }
    void checkAdminConsent().then((granted) => {
      setConsentChecked(true);
      if (granted) void fetch();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => items.map(toNetworkRow), [items]);
  const summary = useMemo(() => summarizeNetwork(rows), [rows]);
  const shown = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.posture === filter)),
    [rows, filter],
  );

  async function grant() {
    setGranting(true);
    setConsentError(null);
    const ok = await requestAdminConsent();
    setGranting(false);
    if (ok) void fetch();
    else
      setConsentError(
        'Access was not granted. Your tenant admin may need to approve this request first.',
      );
  }

  const header = (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">Network</h1>
      <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
        Which workspaces restrict inbound and outbound public network access.
      </p>
    </div>
  );

  if (!consentChecked) {
    return (
      <div className="space-y-4 p-6">
        {header}
        <div className="m-skeleton h-48 rounded-xl" />
      </div>
    );
  }

  if (!demo && !hasAdminAccess) {
    return (
      <div className="space-y-4 p-6">
        {header}
        <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
          <h2 className="text-lg font-semibold text-[var(--m-text)]">
            Network posture requires Fabric Admin API access
          </h2>
          <p className="text-sm text-[var(--m-text-secondary)]">
            fabric-lens reads the tenant-wide workspace network policies. This needs the Fabric
            Administrator role.
          </p>
          <button
            onClick={() => void grant()}
            disabled={granting}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--m-primary-600)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--m-primary-700)] disabled:opacity-50"
          >
            {granting ? 'Requesting access...' : 'Grant Admin Access'}
          </button>
          {consentError && <p className="text-sm text-[var(--m-error)]">{consentError}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        {header}
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] p-6 text-center">
          <p className="text-sm text-[var(--m-text)]">{error}</p>
          <button
            onClick={() => void fetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--m-primary-600)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--m-primary-700)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && rows.length === 0) {
    return (
      <div className="space-y-4 p-6">
        {header}
        <div className="m-skeleton h-24 rounded-xl" />
        <div className="m-skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        {header}
        <button
          onClick={() =>
            exportToCSV(
              shown.map((r) => ({
                Workspace: r.workspaceName,
                'Workspace ID': r.workspaceId,
                Posture: POSTURE_LABEL[r.posture],
                'Inbound public access': blockLabel(r.inboundDenied),
                'Outbound public access': blockLabel(r.outboundDenied),
                'IP firewall rules': r.firewallRules,
                'Managed private endpoints': r.privateEndpoints,
                Note: r.gitAllowedUnderDeny ? 'Git still allowed' : '',
              })),
              'fabric-lens-network-posture.csv',
            )
          }
          disabled={shown.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--m-border)] px-3 py-2 text-sm font-medium text-[var(--m-text)] transition-colors hover:bg-[var(--m-surface)] disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Workspaces" value={summary.total} icon={Network} />
        <StatCard
          label="Isolated"
          value={summary.isolated}
          icon={ShieldCheck}
          signal="Inbound and outbound blocked"
        />
        <StatCard
          label="Partly protected"
          value={summary.inboundOnly + summary.outboundOnly}
          icon={Shield}
          signal="One direction blocked"
        />
        <StatCard
          label="Open"
          value={summary.open}
          icon={Globe}
          signal={`${summary.protectedPct}% of workspaces restrict a direction`}
        />
      </div>

      {summary.total > 0 && summary.open === summary.total && (
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] p-4 text-sm text-[var(--m-text-secondary)]">
          No workspace restricts public network access. That is the default, not a fault. Outbound
          protection needs the workspace on an F-SKU capacity and the tenant setting &quot;Configure
          workspace-level outbound network rules&quot; enabled; inbound protection uses
          workspace-level private links.
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by posture">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`min-h-6 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.id
                ? 'border-[var(--m-primary)] bg-[var(--m-primary-subtle)] text-[var(--m-primary)]'
                : 'border-[var(--m-border)] text-[var(--m-text-secondary)] hover:bg-[var(--m-surface)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={shown}
        loading={loading}
        emptyMessage="No workspaces match this filter."
      />
    </div>
  );
}
