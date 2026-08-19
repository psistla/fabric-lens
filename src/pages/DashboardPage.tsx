import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  FolderOpen,
  Package,
  Gauge,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useCapacityStore } from '@/store/capacityStore';
import { useUiStore } from '@/store/uiStore';
import { StatCard } from '@/components/shared/StatCard';
import { GovernanceIssuesPanel } from '@/components/dashboard/GovernanceIssuesPanel';
import { aggregateGovernanceIssues } from '@/utils/governanceIssues';
import { calculateWorkspaceHealth, getGrade } from '@/utils/healthScore';
import { useNamingPattern } from '@/hooks/useNamingPattern';
import type { HealthScore } from '@/utils/healthScore';
import { ExportButton } from '@/components/shared/ExportButton';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { HealthGrid } from '@/components/dashboard/HealthGrid';
import { SecurityQuickView } from '@/components/dashboard/SecurityQuickView';
import { ScoreRing } from '@/components/dashboard/ScoreRing';
import { exportToJSON } from '@/utils/export';
import { CHART_COLORS, CHART_FALLBACK_COLOR, CHART_TOOLTIP_STYLE, HEALTH_GRADE_COLORS, BENCHMARK_HEALTH_SCORE } from '@/utils/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const GRADE_ORDER = ['F', 'D', 'C', 'B', 'A'] as const;

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const navigate = useNavigate();

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
    if (workspaces.length === 0) {
      void loadData();
    } else if (Object.keys(allItemsByWorkspace).length === 0) {
      void fetchAllItems();
    }
  }, [workspaces.length, allItemsByWorkspace, loadData, fetchAllItems]);

  // All items flattened
  const allItems = useMemo(
    () => Object.values(allItemsByWorkspace).flat(),
    [allItemsByWorkspace],
  );

  const namingPattern = useNamingPattern();

  // Health results map — computed once, drives all health-derived data
  const { healthMap, healthError } = useMemo((): {
    healthMap: Map<string, HealthScore>;
    healthError: string | null;
  } => {
    try {
      const map = new Map<string, HealthScore>(
        workspaces.map((ws) => {
          const wsItems = allItemsByWorkspace[ws.id] ?? [];
          return [ws.id, calculateWorkspaceHealth(ws, wsItems, namingPattern)];
        }),
      );
      return { healthMap: map, healthError: null };
    } catch (err) {
      return {
        healthMap: new Map<string, HealthScore>(),
        healthError:
          err instanceof Error ? err.message : 'Health score computation failed',
      };
    }
  }, [workspaces, allItemsByWorkspace, namingPattern]);

  // Tenant-level score, grade, and at-risk count
  const { tenantScore, tenantGrade, atRiskCount } = useMemo(() => {
    if (healthMap.size === 0) return { tenantScore: 0, tenantGrade: 'F', atRiskCount: 0 };
    const scores = [...healthMap.values()].map((h) => h.percentage);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const risk = [...healthMap.values()].filter(
      (h) => h.grade === 'D' || h.grade === 'F',
    ).length;
    return { tenantScore: avg, tenantGrade: getGrade(avg), atRiskCount: risk };
  }, [healthMap]);

  // Capacity stats
  const { activeCapacityCount, pausedCapacityCount } = useMemo(() => {
    const active = capacities.filter((c) => c.state === 'Active').length;
    return { activeCapacityCount: active, pausedCapacityCount: capacities.length - active };
  }, [capacities]);

  // Distinct item type count
  const distinctTypeCount = useMemo(
    () => new Set(allItems.map((i) => i.type)).size,
    [allItems],
  );

  // Health grid data
  const healthGridData = useMemo(
    () =>
      workspaces.map((ws) => {
        const health = healthMap.get(ws.id);
        const topFailed = health?.checks
          .filter((c) => !c.passed)
          .sort((a, b) => b.maxPoints - a.maxPoints)[0];
        return {
          id: ws.id,
          name: ws.displayName,
          score: health?.percentage ?? 0,
          grade: health?.grade ?? 'F',
          topFailedCheck: topFailed?.detail,
        };
      }),
    [workspaces, healthMap],
  );

  // Aggregated governance issues
  const aggregatedIssues = useMemo(
    () => aggregateGovernanceIssues(workspaces, healthMap),
    [workspaces, healthMap],
  );

  // Grade distribution for chart (worst → best)
  const gradeDist = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of healthMap.values()) {
      counts.set(h.grade, (counts.get(h.grade) ?? 0) + 1);
    }
    return GRADE_ORDER
      .filter((g) => (counts.get(g) ?? 0) > 0)
      .map((g) => ({ grade: g, count: counts.get(g) ?? 0, color: HEALTH_GRADE_COLORS[g] }));
  }, [healthMap]);

  // Item type distribution — top 12 + "Other"
  const itemDist = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of allItems) {
      counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
    }
    const sorted = [...counts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    const total = allItems.length;
    const top12 = sorted.slice(0, 12);
    const rest = sorted.slice(12);
    const entries = top12.map((e, i) => ({
      type: e.type,
      count: e.count,
      pct: total > 0 ? Math.round((e.count / total) * 100) : 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
    if (rest.length > 0) {
      const otherCount = rest.reduce((sum, e) => sum + e.count, 0);
      entries.push({
        type: 'Other',
        count: otherCount,
        pct: total > 0 ? Math.round((otherCount / total) * 100) : 0,
        color: CHART_FALLBACK_COLOR as typeof CHART_COLORS[number],
      });
    }
    return entries;
  }, [allItems]);

  const handleExport = useCallback(() => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      summary: {
        totalWorkspaces: workspaces.length,
        totalItems: allItems.length,
        activeCapacities: activeCapacityCount,
        tenantScore,
        tenantGrade,
        atRiskCount,
      },
      workspaces: workspaces.map((ws) => {
        const wsItems = allItemsByWorkspace[ws.id] ?? [];
        const health = calculateWorkspaceHealth(ws, wsItems, namingPattern);
        const cap = ws.capacityId ? getCapacityById(ws.capacityId) : null;
        return {
          id: ws.id,
          name: ws.displayName,
          type: ws.type,
          state: ws.state,
          capacity: cap?.displayName ?? null,
          sku: cap?.sku ?? null,
          healthScore: health.percentage,
          healthGrade: health.grade,
          itemCount: wsItems.length,
        };
      }),
    };
    exportToJSON(snapshot, 'fabric-lens-snapshot.json');
  }, [
    workspaces,
    allItems,
    allItemsByWorkspace,
    activeCapacityCount,
    tenantScore,
    tenantGrade,
    atRiskCount,
    getCapacityById,
    namingPattern,
  ]);

  const refreshLabel = lastRefresh
    ? `Last refreshed: ${new Date(lastRefresh).toLocaleTimeString()}`
    : undefined;

  // Loading skeleton
  if (loading && workspaces.length === 0) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="m-skeleton h-7 w-64" />
            <div className="m-skeleton mt-2 h-4 w-80" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[auto_1fr_1fr_1fr]">
          <div className="m-skeleton h-28 rounded-xl md:col-span-3 lg:col-span-1" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="m-skeleton h-[104px] rounded-xl" />
          ))}
        </div>
        {/* SecurityQuickView placeholder */}
        <div className="m-skeleton h-40 rounded-xl" />
        <div className="m-skeleton h-56 rounded-xl" />
        <div className="m-skeleton h-64 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="m-skeleton h-56 rounded-xl" />
          ))}
        </div>
        <div className="m-skeleton h-20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Error banner */}
      {healthError && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--m-error)] bg-[var(--m-error-bg)] px-4 py-3 text-sm text-[var(--m-error-text)]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Health score computation encountered an error: {healthError}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">
            Governance Posture Assessment
          </h1>
          <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
            Tenant-wide health, coverage, and risk overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {refreshLabel && (
            <span className="text-xs text-[var(--m-text-tertiary)]">{refreshLabel}</span>
          )}
          {workspaces.length > 0 && (
            <ExportButton onClick={handleExport} label="Export JSON" />
          )}
          {workspaces.length > 0 && (
            <button
              onClick={() => navigate('/report')}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-[var(--m-primary-600)] text-white hover:opacity-90 transition-opacity"
            >
              <FileText className="h-3.5 w-3.5" />
              Generate Report
            </button>
          )}
          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--m-text-secondary)] transition-colors hover:bg-[var(--m-surface)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Section 1: Headline row — ScoreRing + 3 StatCards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[auto_1fr_1fr_1fr]">
        {/* Tenant score ring card */}
        <div className="flex items-center gap-5 rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-5 md:col-span-3 lg:col-span-1">
          <ScoreRing score={tenantScore} grade={tenantGrade} size={96} benchmark={BENCHMARK_HEALTH_SCORE} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--m-text)]">Tenant Health Score</p>
            <p className="mt-0.5 text-xs text-[var(--m-text-secondary)]">
              Average across {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <StatCard
          label="Workspaces"
          value={workspaces.length}
          icon={FolderOpen}
          signal={
            atRiskCount > 0
              ? `${atRiskCount} at risk (grade D or F)`
              : 'All workspaces grade C+'
          }
          signalColor={atRiskCount > 0 ? 'var(--m-error)' : undefined}
        />

        <StatCard
          label="Total Items"
          value={allItems.length}
          icon={Package}
          signal={`${distinctTypeCount} distinct type${distinctTypeCount !== 1 ? 's' : ''}`}
        />

        <StatCard
          label="Capacities"
          value={capacities.length}
          icon={Gauge}
          signal={`${activeCapacityCount} active · ${pausedCapacityCount} paused`}
          signalColor={pausedCapacityCount > 0 ? 'var(--m-warning)' : undefined}
        />
      </div>

      {/* Section 2: Health Grid — the signature view, directly under the score */}
      {workspaces.length > 0 && (
        <HealthGrid
          workspaces={healthGridData}
          onWorkspaceClick={(id) => void navigate(`/workspaces/${id}`)}
        />
      )}

      {/* Section 3: what to do about it */}
      <GovernanceIssuesPanel issues={aggregatedIssues} workspaces={workspaces} />

      <SecurityQuickView />

      {/* Section 4: distributions. Useful context, but they answer "how is the
          tenant shaped", not "what needs attention", so they sit behind a fold. */}
      <CollapsibleSection
        title="Distributions"
        description="Health grades and item types across the tenant."
      >
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
          Health Grade Distribution
        </h3>
        {gradeDist.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              layout="vertical"
              data={gradeDist}
              margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="grade"
                width={24}
                tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--m-text-secondary)' }}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                itemStyle={{ color: '#e2e8f0' }}
                cursor={{ fill: 'var(--m-surface)' }}
                formatter={(value?: number | string | ReadonlyArray<string | number>) => {
                  const n = typeof value === 'number' ? value : 0;
                  return [`${n} workspace${n !== 1 ? 's' : ''}`, 'Count'] as [string, string];
                }}
              />
              <Bar dataKey="count" radius={4} maxBarSize={28}>
                {gradeDist.map((entry) => (
                  <Cell key={entry.grade} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[180px] items-center justify-center text-sm text-[var(--m-text-tertiary)]">
            No health data yet
          </div>
        )}
      </div>

      {/* Section 5: Item Distribution */}
      {itemDist.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
            Item Distribution
          </h3>
          <div className="flex flex-wrap gap-2">
            {itemDist.map((entry) => (
              <div
                key={entry.type}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--m-border)] bg-[var(--m-surface)] px-2.5 py-1"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[11px] font-medium text-[var(--m-text)]">
                  {entry.type}
                </span>
                <span className="font-mono text-[11px] text-[var(--m-text-secondary)]">
                  {entry.count}
                </span>
                <span className="text-[11px] text-[var(--m-text-tertiary)]">
                  {entry.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </CollapsibleSection>
    </div>
  );
}
