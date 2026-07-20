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
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

function CopyText({ text }: { text: string }) {
  return (
    <span className="group inline-flex items-center gap-1.5">
      <code className="rounded bg-[var(--m-surface)] px-2 py-0.5 text-xs text-[var(--m-text-secondary)]">
        {text}
      </code>
      <button
        onClick={() => void navigator.clipboard.writeText(text)}
        title="Copy"
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Copy className="h-3 w-3 text-[var(--m-text-tertiary)] hover:text-[var(--m-text)]" />
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
  useDocumentTitle(workspace?.displayName ?? 'Workspace');

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
        <span className="font-medium text-[var(--m-text)]">
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
        <span className="text-[var(--m-text-secondary)]">
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
          className="mb-4 flex items-center gap-1 text-sm text-[var(--m-text-secondary)] hover:text-[var(--m-text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspaces
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--m-error)] bg-[var(--m-error-bg)] px-4 py-3 text-sm text-[var(--m-error-text)]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Unable to load workspace. Please try again.
        </div>
      </div>
    );
  }

  if (loading || !workspace) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-6 w-48 m-skeleton" />
        <div className="h-4 w-96 m-skeleton" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="m-skeleton h-24 rounded-xl"
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
        className="flex items-center gap-1 text-sm text-[var(--m-text-secondary)] hover:text-[var(--m-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workspaces
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">
            {workspace.displayName}
          </h1>
          {healthScore && (
            <HealthBadge grade={healthScore.grade} percentage={healthScore.percentage} />
          )}
        </div>
        {workspace.description && (
          <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
            {workspace.description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-lg bg-[var(--m-surface)] px-2 py-0.5 text-xs font-medium text-[var(--m-text-secondary)]">
            {workspace.type}
          </span>
          <StateBadge state={workspace.state} />
          {capacity && (
            <span className="inline-flex rounded-full bg-[var(--m-primary-subtle)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--m-primary)]">
              {capacity.displayName} ({capacity.sku})
            </span>
          )}
          {workspace.capacityRegion && (
            <span className="text-xs text-[var(--m-text-secondary)]">
              {workspace.capacityRegion}
            </span>
          )}
        </div>
      </div>

      {/* Health leads: the score and the checks that failed are the reason to
          open a workspace, so they sit above the inventory counts. */}
      {healthScore && <HealthDetail score={healthScore} />}

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

      {/* OneLake Endpoints */}
      {workspace.oneLakeEndpoints && (
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
          <h2 className="text-sm font-medium text-[var(--m-text)]">
            OneLake Endpoints
          </h2>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-10 text-xs text-[var(--m-text-secondary)]">
                Blob
              </span>
              <CopyText text={workspace.oneLakeEndpoints.blobEndpoint} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-10 text-xs text-[var(--m-text-secondary)]">
                DFS
              </span>
              <CopyText text={workspace.oneLakeEndpoints.dfsEndpoint} />
            </div>
          </div>
        </div>
      )}

      {/* Workspace Identity */}
      {workspace.workspaceIdentity ? (
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
          <h2 className="text-sm font-medium text-[var(--m-text)]">
            Workspace Identity
          </h2>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-[var(--m-text-secondary)]">
                App ID
              </span>
              <CopyText text={workspace.workspaceIdentity.applicationId} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-[var(--m-text-secondary)]">
                SPN ID
              </span>
              <CopyText text={workspace.workspaceIdentity.servicePrincipalId} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--m-warning)] bg-[var(--m-warning-bg)] px-4 py-3 text-sm text-[var(--m-warning-text)]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Workspace identity (SPN) is not configured.
        </div>
      )}

      {/* Type breakdown */}
      {typeCounts.length > 0 && (
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
          <h2 className="text-sm font-medium text-[var(--m-text)]">
            Items by Type
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {typeCounts.map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 rounded-lg border border-[var(--m-border)] px-3 py-1.5"
              >
                <span className="text-sm text-[var(--m-text-secondary)]">
                  {type}
                </span>
                <span className="rounded-full bg-[var(--m-surface)] px-1.5 py-0.5 text-xs font-medium text-[var(--m-text-secondary)]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items table */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-[var(--m-text)]">
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
