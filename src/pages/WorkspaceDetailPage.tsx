import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Copy,
  AlertCircle,
  Package,
  Layers,
  Server,
  KeyRound,
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useCapacityStore } from '@/store/capacityStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatCard } from '@/components/shared/StatCard';
import { ItemTypeBadge } from '@/components/shared/ItemTypeBadge';
import { StateBadge } from '@/components/shared/StateBadge';
import { HealthBadge } from '@/components/workspace/HealthBadge';
import { HealthDetail } from '@/components/workspace/HealthDetail';
import { calculateWorkspaceHealth } from '@/utils/healthScore';
import type { Item } from '@/api/types/item';

function CopyText({ text }: { text: string }) {
  return (
    <span className="group inline-flex items-center gap-1.5">
      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {text}
      </code>
      <button
        onClick={() => void navigator.clipboard.writeText(text)}
        title="Copy"
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Copy className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
      </button>
    </span>
  );
}

export function WorkspaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedWorkspace: workspace,
    selectedWorkspaceItems: items,
    loading,
    error,
    fetchWorkspaceDetail,
    fetchWorkspaceItems,
    clearSelection,
  } = useWorkspaceStore();
  const { getCapacityById, fetchCapacities } = useCapacityStore();

  useEffect(() => {
    if (id) {
      void fetchWorkspaceDetail(id);
      void fetchWorkspaceItems(id);
      void fetchCapacities();
    }
    return () => clearSelection();
  }, [id, fetchWorkspaceDetail, fetchWorkspaceItems, fetchCapacities, clearSelection]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [items]);

  const uniqueTypes = useMemo(() => {
    return new Set(items.map((i) => i.type)).size;
  }, [items]);

  const capacity = workspace?.capacityId
    ? getCapacityById(workspace.capacityId)
    : undefined;

  const healthScore = useMemo(() => {
    if (!workspace) return null;
    return calculateWorkspaceHealth(workspace, items);
  }, [workspace, items]);

  const columns: Column<Item>[] = [
    {
      key: 'displayName',
      header: 'Name',
      sortable: true,
      render: (_val, row) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {row.displayName}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (_val, row) => <ItemTypeBadge type={row.type} />,
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false,
      render: (_val, row) => (
        <span className="text-slate-500 dark:text-slate-400">
          {row.description || '—'}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => void navigate('/workspaces')}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspaces
        </button>
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  if (loading || !workspace) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back button */}
      <button
        onClick={() => void navigate('/workspaces')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workspaces
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {workspace.displayName}
          </h1>
          {healthScore && (
            <HealthBadge grade={healthScore.grade} percentage={healthScore.percentage} />
          )}
        </div>
        {workspace.description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {workspace.description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {workspace.type}
          </span>
          <StateBadge state={workspace.state} />
          {capacity && (
            <span className="inline-flex rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {capacity.displayName} ({capacity.sku})
            </span>
          )}
          {workspace.capacityRegion && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {workspace.capacityRegion}
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Items"
          value={items.length}
          icon={Package}
        />
        <StatCard
          label="Item Types"
          value={uniqueTypes}
          icon={Layers}
        />
        <StatCard
          label="Capacity"
          value={capacity?.displayName ?? 'None'}
          icon={Server}
        />
        <StatCard
          label="Identity"
          value={workspace.workspaceIdentity ? 'Configured' : 'None'}
          icon={KeyRound}
          trend={
            workspace.workspaceIdentity
              ? undefined
              : { direction: 'neutral', label: 'Not configured' }
          }
        />
      </div>

      {/* Health Score */}
      {healthScore && <HealthDetail score={healthScore} />}

      {/* OneLake Endpoints */}
      {workspace.oneLakeEndpoints && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            OneLake Endpoints
          </h2>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-10 text-xs text-slate-500 dark:text-slate-400">
                Blob
              </span>
              <CopyText text={workspace.oneLakeEndpoints.blobEndpoint} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-10 text-xs text-slate-500 dark:text-slate-400">
                DFS
              </span>
              <CopyText text={workspace.oneLakeEndpoints.dfsEndpoint} />
            </div>
          </div>
        </div>
      )}

      {/* Workspace Identity */}
      {workspace.workspaceIdentity ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Workspace Identity
          </h2>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-slate-500 dark:text-slate-400">
                App ID
              </span>
              <CopyText text={workspace.workspaceIdentity.applicationId} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-slate-500 dark:text-slate-400">
                SPN ID
              </span>
              <CopyText text={workspace.workspaceIdentity.servicePrincipalId} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Workspace identity (SPN) is not configured.
        </div>
      )}

      {/* Type breakdown */}
      {typeCounts.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Items by Type
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {typeCounts.map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 dark:border-slate-700"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {type}
                </span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items table */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-100">
          Items ({items.length})
        </h2>
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No items in this workspace."
        />
      </div>
    </div>
  );
}
