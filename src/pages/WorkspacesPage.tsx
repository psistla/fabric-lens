import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useCapacityStore } from '@/store/capacityStore';
import { useSecurityStore } from '@/store/securityStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { StateBadge } from '@/components/shared/StateBadge';
import { ExportButton } from '@/components/shared/ExportButton';
import { HealthBadge } from '@/components/workspace/HealthBadge';
import { calculateWorkspaceHealth, type HealthScore } from '@/utils/healthScore';
import { useNamingPattern } from '@/hooks/useNamingPattern';
import { exportToCSV } from '@/utils/export';
import { getCurrentUserEmail } from '@/auth/currentUser';
import { getMyWorkspaceIds } from '@/utils/myWorkspaces';
import { isEffectiveDemoMode } from '@/auth/AuthProvider';
import type { Workspace } from '@/api/types/workspace';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function WorkspacesPage() {
  useDocumentTitle('Workspaces');
  const navigate = useNavigate();
  const {
    workspaces,
    allItemsByWorkspace,
    loading,
    error,
    fetchWorkspaces,
    fetchAllItems,
  } = useWorkspaceStore();
  const { fetchCapacities, getCapacityById } = useCapacityStore();
  const { workspaceUsers, populateDemoUsers } = useSecurityStore();
  const [search, setSearch] = useState('');
  const [myOnly, setMyOnly] = useState(false);

  const hasScanned = Object.keys(workspaceUsers).length > 0;
  const userEmail = getCurrentUserEmail();
  const showToggle = hasScanned || isEffectiveDemoMode();

  useEffect(() => {
    void fetchWorkspaces();
    void fetchCapacities();
    void fetchAllItems();
    populateDemoUsers();
  }, [fetchWorkspaces, fetchCapacities, fetchAllItems, populateDemoUsers]);

  const namingPattern = useNamingPattern();

  // Health per workspace, from the same scorer the dashboard and detail pages use.
  const healthMap = useMemo(
    () =>
      new Map<string, HealthScore>(
        workspaces.map((w) => [
          w.id,
          calculateWorkspaceHealth(w, allItemsByWorkspace[w.id] ?? [], namingPattern),
        ]),
      ),
    [workspaces, allItemsByWorkspace, namingPattern],
  );

  const myWorkspaceIds = useMemo(
    () => (myOnly && userEmail ? getMyWorkspaceIds(userEmail, workspaceUsers) : null),
    [myOnly, userEmail, workspaceUsers],
  );

  const atRiskCount = useMemo(
    () =>
      [...healthMap.values()].filter((h) => h.grade === 'D' || h.grade === 'F')
        .length,
    [healthMap],
  );

  const filtered = useMemo(() => {
    let list = myWorkspaceIds
      ? workspaces.filter((w) => myWorkspaceIds.has(w.id))
      : workspaces;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((w) => w.displayName.toLowerCase().includes(q));
    }
    return list;
  }, [workspaces, myWorkspaceIds, search]);

  const handleExport = useCallback(() => {
    const rows = filtered.map((w) => {
      const cap = w.capacityId ? getCapacityById(w.capacityId) : null;
      return {
        Name: w.displayName,
        Type: w.type,
        State: w.state,
        Capacity: cap?.displayName ?? '',
        SKU: cap?.sku ?? '',
        Region: w.capacityRegion ?? '',
        Description: w.description,
        HasGitIntegration: w.workspaceIdentity ? 'Yes' : 'No',
      };
    });
    exportToCSV(rows, 'fabric-lens-workspaces.csv');
  }, [filtered, getCapacityById]);

  const columns: Column<Workspace>[] = useMemo(
    () => [
      {
        key: 'displayName',
        header: 'Name',
        sortable: true,
        render: (_val, row) => (
          <span className="font-medium text-[var(--m-text)]">
            {row.displayName}
          </span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (_val, row) => (
          <span className="inline-flex rounded-full bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-text-secondary)]">
            {row.type}
          </span>
        ),
      },
      {
        key: 'capacityId',
        header: 'Capacity',
        sortable: false,
        render: (_val, row) => {
          if (!row.capacityId) {
            return (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--m-warning)]">
                <AlertCircle className="h-3 w-3" />
                None
              </span>
            );
          }
          const cap = getCapacityById(row.capacityId);
          return (
            <span className="text-[var(--m-text-secondary)]">
              {cap?.displayName ?? row.capacityId}
            </span>
          );
        },
      },
      {
        key: 'capacityRegion',
        header: 'Region',
        sortable: true,
        render: (_val, row) => (
          <span className="text-[var(--m-text-secondary)]">
            {row.capacityRegion ?? '—'}
          </span>
        ),
      },
      {
        key: 'state',
        header: 'State',
        sortable: true,
        render: (_val, row) => <StateBadge state={row.state} />,
      },
      {
        // Health is derived, not a Workspace field, so it borrows `id` as its
        // column key and opts out of sorting rather than widening Column<T>.
        key: 'id',
        header: 'Health',
        sortable: false,
        render: (_val, row) => {
          const health = healthMap.get(row.id);
          if (!health) return null;
          return (
            <HealthBadge grade={health.grade} percentage={health.percentage} />
          );
        },
      },
    ],
    [getCapacityById, healthMap],
  );

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">
            Workspaces
          </h1>
          <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
            {workspaces.length > 0 ? (
              <>
                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                {atRiskCount > 0 ? (
                  <>
                    {', '}
                    <span className="font-semibold text-[var(--m-error)]">
                      {atRiskCount} at risk
                    </span>
                    {' (grade D or F)'}
                  </>
                ) : (
                  ', all grade C or better'
                )}
              </>
            ) : (
              'Browse and manage tenant workspaces.'
            )}
          </p>
        </div>
        {workspaces.length > 0 && (
          <ExportButton onClick={handleExport} label="Export CSV" />
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--m-error)] bg-[var(--m-error-bg)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-[var(--m-error-text)]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Unable to connect to Fabric API. Please check your connection.
          </div>
          <button
            onClick={() => {
              void fetchWorkspaces();
              void fetchCapacities();
            }}
            className="shrink-0 rounded-lg bg-[var(--m-error-bg)] px-3 py-1 text-xs font-semibold text-[var(--m-error-text)] ring-1 ring-[var(--m-error)] transition-colors hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-full sm:w-72">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search workspaces..."
            />
          </div>
          {showToggle && (
            <div className="flex shrink-0 overflow-hidden rounded-lg ring-1 ring-[var(--m-border)]">
              {(['all', 'mine'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setMyOnly(v === 'mine')}
                  className={[
                    'px-3 py-1.5 text-xs font-semibold transition-colors',
                    (v === 'mine') === myOnly
                      ? 'bg-[var(--m-primary-600)] text-white'
                      : 'bg-[var(--m-surface)] text-[var(--m-text-secondary)] hover:bg-[var(--m-surface-raised)]',
                  ].join(' ')}
                >
                  {v === 'all' ? 'All' : 'My workspaces'}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-[var(--m-text-secondary)]">
          Showing {filtered.length} of {workspaces.length} workspaces
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No workspaces found."
        onRowClick={(row) => void navigate(`/workspaces/${row.id}`)}
      />
    </div>
  );
}
