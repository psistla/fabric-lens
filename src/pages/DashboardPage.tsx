import { useEffect, useMemo, useCallback } from 'react';
import {
  FolderOpen,
  Package,
  Gauge,
  Heart,
  RefreshCw,
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useCapacityStore } from '@/store/capacityStore';
import { useUiStore } from '@/store/uiStore';
import { StatCard } from '@/components/shared/StatCard';
import { ItemsByTypeChart } from '@/components/charts/ItemsByTypeChart';
import { WorkspacesByCapacityChart } from '@/components/charts/WorkspacesByCapacityChart';
import { GovernanceIssues } from '@/components/workspace/GovernanceIssues';
import { calculateWorkspaceHealth } from '@/utils/healthScore';
import { ExportButton } from '@/components/shared/ExportButton';
import { HealthGrid } from '@/components/dashboard/HealthGrid';
import { exportToJSON } from '@/utils/export';

export function DashboardPage() {
  const {
    workspaces,
    allItemsByWorkspace,
    loading: wsLoading,
    fetchWorkspaces,
    fetchAllItems,
  } = useWorkspaceStore();
  const {
    capacities,
    loading: capLoading,
    fetchCapacities,
    getCapacityById,
  } = useCapacityStore();
  const lastRefresh = useUiStore((s) => s.lastRefresh);
  const setLastRefresh = useUiStore((s) => s.setLastRefresh);

  const loading = wsLoading || capLoading;

  const loadData = useCallback(async () => {
    await Promise.all([fetchWorkspaces(), fetchCapacities()]);
    await fetchAllItems();
    setLastRefresh();
  }, [fetchWorkspaces, fetchCapacities, fetchAllItems, setLastRefresh]);

  useEffect(() => {
    // Use cached data if already loaded, but still allow manual refresh
    if (workspaces.length === 0) {
      void loadData();
    } else if (Object.keys(allItemsByWorkspace).length === 0) {
      void fetchAllItems();
    }
  }, [workspaces.length, allItemsByWorkspace, loadData, fetchAllItems]);

  // Aggregate stats
  const allItems = useMemo(
    () => Object.values(allItemsByWorkspace).flat(),
    [allItemsByWorkspace],
  );

  const activeCapacityCount = useMemo(
    () => capacities.filter((c) => c.state === 'Active').length,
    [capacities],
  );

  const avgHealthScore = useMemo(() => {
    if (workspaces.length === 0) return 0;
    const scores = workspaces.map((ws) => {
      const wsItems = allItemsByWorkspace[ws.id] ?? [];
      return calculateWorkspaceHealth(ws, wsItems).percentage;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [workspaces, allItemsByWorkspace]);

  // Items by type chart data
  const itemsByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of allItems) {
      counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allItems]);

  // Workspaces by capacity chart data
  const workspacesByCapacity = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ws of workspaces) {
      const capName = ws.capacityId
        ? (getCapacityById(ws.capacityId)?.displayName ?? 'Unknown')
        : 'No Capacity';
      counts.set(capName, (counts.get(capName) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [workspaces, getCapacityById]);

  // Governance issue counts
  const governance = useMemo(() => {
    let noCapacity = 0;
    let noDescription = 0;
    let noGitIntegration = 0;
    let personalWorkspaces = 0;
    for (const ws of workspaces) {
      if (!ws.capacityId) noCapacity++;
      if (!ws.description.trim()) noDescription++;
      if (!ws.workspaceIdentity) noGitIntegration++;
      if (ws.type === 'Personal') personalWorkspaces++;
    }
    return { noCapacity, noDescription, noGitIntegration, personalWorkspaces };
  }, [workspaces]);

  const handleExport = useCallback(() => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      summary: {
        totalWorkspaces: workspaces.length,
        totalItems: allItems.length,
        activeCapacities: activeCapacityCount,
        avgHealthScore,
      },
      workspaces: workspaces.map((ws) => {
        const wsItems = allItemsByWorkspace[ws.id] ?? [];
        const health = calculateWorkspaceHealth(ws, wsItems);
        const cap = ws.capacityId ? getCapacityById(ws.capacityId) : null;
        return {
          id: ws.id,
          name: ws.displayName,
          type: ws.type,
          state: ws.state,
          capacity: cap?.displayName ?? null,
          sku: cap?.sku ?? null,
          region: ws.capacityRegion ?? null,
          healthScore: health.percentage,
          healthGrade: health.grade,
          itemCount: wsItems.length,
        };
      }),
      capacities: capacities.map((c) => ({
        id: c.id,
        name: c.displayName,
        sku: c.sku,
        region: c.region,
        state: c.state,
      })),
      itemsByType: itemsByType.map((i) => ({
        type: i.name,
        count: i.value,
      })),
      governance,
    };
    exportToJSON(snapshot, 'fabric-lens-snapshot.json');
  }, [
    workspaces,
    allItems,
    allItemsByWorkspace,
    capacities,
    activeCapacityCount,
    avgHealthScore,
    itemsByType,
    governance,
    getCapacityById,
  ]);

  const refreshLabel = lastRefresh
    ? `Last refreshed: ${new Date(lastRefresh).toLocaleTimeString()}`
    : undefined;

  if (loading && workspaces.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-40 animate-pulse rounded bg-[var(--surface-secondary)]" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[var(--surface-secondary)]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[104px] animate-pulse rounded-lg bg-[var(--surface-secondary)]"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-lg bg-[var(--surface-secondary)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Tenant overview and health summary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {refreshLabel && (
            <span className="text-xs text-[var(--text-tertiary)]">
              {refreshLabel}
            </span>
          )}
          {workspaces.length > 0 && (
            <ExportButton onClick={handleExport} label="Export JSON" />
          )}
          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-tertiary)] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Workspaces"
          value={workspaces.length}
          icon={FolderOpen}
        />
        <StatCard
          label="Total Items"
          value={allItems.length}
          icon={Package}
        />
        <StatCard
          label="Active Capacities"
          value={activeCapacityCount}
          icon={Gauge}
        />
        <StatCard
          label="Avg Health Score"
          value={`${avgHealthScore}%`}
          icon={Heart}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
          <h2 className="mb-2 text-sm font-medium text-[var(--text-primary)]">
            Items by Type
          </h2>
          <ItemsByTypeChart data={itemsByType} />
        </div>
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
          <h2 className="mb-2 text-sm font-medium text-[var(--text-primary)]">
            Workspaces by Capacity
          </h2>
          <WorkspacesByCapacityChart data={workspacesByCapacity} />
        </div>
      </div>

      {/* Health Grid */}
      {workspaces.length > 0 && (
        <HealthGrid
          workspaces={workspaces}
          allItemsByWorkspace={allItemsByWorkspace}
        />
      )}

      {/* Governance Issues */}
      <GovernanceIssues
        noCapacity={governance.noCapacity}
        noDescription={governance.noDescription}
        noGitIntegration={governance.noGitIntegration}
        personalWorkspaces={governance.personalWorkspaces}
      />
    </div>
  );
}
