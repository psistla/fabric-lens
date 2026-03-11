import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useCapacityStore } from '@/store/capacityStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { StateBadge } from '@/components/shared/StateBadge';
import { ExportButton } from '@/components/shared/ExportButton';
import { exportToCSV } from '@/utils/export';
import type { Workspace } from '@/api/types/workspace';

export function WorkspacesPage() {
  const navigate = useNavigate();
  const { workspaces, loading, error, fetchWorkspaces } = useWorkspaceStore();
  const { capacities, fetchCapacities, getCapacityById } = useCapacityStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchWorkspaces();
    void fetchCapacities();
  }, [fetchWorkspaces, fetchCapacities]);

  const handleExport = useCallback(() => {
    const rows = workspaces.map((w) => {
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
  }, [workspaces, getCapacityById]);

  const filtered = useMemo(() => {
    if (!search) return workspaces;
    const q = search.toLowerCase();
    return workspaces.filter((w) =>
      w.displayName.toLowerCase().includes(q),
    );
  }, [workspaces, search]);

  const columns: Column<Workspace>[] = useMemo(
    () => [
      {
        key: 'displayName',
        header: 'Name',
        sortable: true,
        render: (_val, row) => (
          <span className="font-medium text-[var(--text-primary)]">
            {row.displayName}
          </span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (_val, row) => (
          <span className="inline-flex rounded-md bg-[var(--surface-secondary)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
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
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3 w-3" />
                None
              </span>
            );
          }
          const cap = getCapacityById(row.capacityId);
          return (
            <span className="text-[var(--text-secondary)]">
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
          <span className="text-[var(--text-secondary)]">
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
    ],
    [capacities, getCapacityById],
  );

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Workspaces
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Browse and manage tenant workspaces.
          </p>
        </div>
        {workspaces.length > 0 && (
          <ExportButton onClick={handleExport} label="Export CSV" />
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Unable to connect to Fabric API. Please check your connection.
          </div>
          <button
            onClick={() => {
              void fetchWorkspaces();
              void fetchCapacities();
            }}
            className="shrink-0 rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search workspaces..."
          />
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
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
