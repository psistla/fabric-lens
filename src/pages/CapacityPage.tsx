import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Calculator,
  Info,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCapacityStore } from '@/store/capacityStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { StateBadge } from '@/components/shared/StateBadge';
import { ExportButton } from '@/components/shared/ExportButton';
import { exportToCSV } from '@/utils/export';
import { SKU_SPECS, SKU_NAMES, SKU_TIER_STYLES, buildSkuSpecsWithRates } from '@/data/skuSpecs';
import type { SkuSpec } from '@/data/skuSpecs';
import { fetchSkuRates, AZURE_REGIONS } from '@/api/azurePricing';
import { isDemoMode } from '@/api/demo';
import type { Capacity } from '@/api/types/capacity';
import type { Item } from '@/api/types/item';
import type { Workspace } from '@/api/types/workspace';

// --- SKU badge ---

function SkuBadge({ sku }: { sku: string }) {
  const spec = SKU_SPECS[sku];
  const style = spec ? SKU_TIER_STYLES[spec.tier] : SKU_TIER_STYLES.gray;
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${style}`}>
      {sku}
    </span>
  );
}

// --- Cost Calculator ---

type PricingStatus = 'idle' | 'loading' | 'live' | 'error';

function useLivePricing(region: string) {
  const [specs, setSpecs] = useState<Record<string, SkuSpec>>(SKU_SPECS);
  const [status, setStatus] = useState<PricingStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isDemoMode) {
        if (!cancelled) {
          setSpecs(SKU_SPECS);
          setStatus('live');
        }
        return;
      }

      if (!cancelled) setStatus('loading');
      try {
        const rates = await fetchSkuRates(region);
        if (cancelled) return;
        if (rates.length > 0) {
          setSpecs(buildSkuSpecsWithRates(rates));
          setStatus('live');
        } else {
          setSpecs(SKU_SPECS);
          setStatus('error');
        }
      } catch {
        if (!cancelled) {
          setSpecs(SKU_SPECS);
          setStatus('error');
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [region, retryCount]);

  return { specs, status, retry: () => setRetryCount((c) => c + 1) };
}

function CostCalculator() {
  const [region, setRegion] = useState('eastus');
  const [sku, setSku] = useState('F64');
  const [hoursPerDay, setHoursPerDay] = useState(24);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [showAutoscale, setShowAutoscale] = useState(false);
  const [utilization, setUtilization] = useState(40);

  const { specs, status, retry } = useLivePricing(region);

  const spec = specs[sku];
  const reservedCost = spec ? spec.rate * hoursPerDay * daysPerMonth : 0;
  const autoscaleCost = reservedCost * (utilization / 100);

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-[var(--text-secondary)]" />
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            Cost Calculator
          </h2>
        </div>

        {/* Pricing status badge */}
        {status === 'loading' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Fetching live rates…
          </span>
        )}
        {status === 'live' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Live pricing (USD)
          </span>
        )}
        {status === 'error' && (
          <button
            onClick={retry}
            className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            <AlertCircle className="h-3 w-3" />
            Using fallback rates — click to retry
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Region select */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Region
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
          >
            {AZURE_REGIONS.map((r) => (
              <option key={r.name} value={r.name}>
                {r.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* SKU select */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            SKU
          </label>
          <select
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
          >
            {SKU_NAMES.map((s) => (
              <option key={s} value={s}>
                {s} — {specs[s].cu} CUs (${specs[s].rate.toFixed(2)}/hr)
              </option>
            ))}
          </select>
        </div>

        {/* Hours per day */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Hours / day
          </label>
          <input
            type="number"
            min={1}
            max={24}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, Number(e.target.value))))}
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
          />
        </div>

        {/* Days per month */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Days / month
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={daysPerMonth}
            onChange={(e) => setDaysPerMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Result */}
      <div className="mt-4 rounded-md bg-[var(--surface-secondary)] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">
            Reserved (always-on)
          </span>
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            ${reservedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal text-[var(--text-secondary)]"> /mo</span>
          </span>
        </div>
      </div>

      {/* Autoscale toggle */}
      <div className="mt-3">
        <button
          onClick={() => setShowAutoscale(!showAutoscale)}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--brand-primary)]"
        >
          {showAutoscale ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Spark Autoscale Billing
        </button>

        {showAutoscale && (
          <div className="mt-3 space-y-3 rounded-md border border-[var(--border-default)] p-3">
            <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>
                With Spark Autoscale, you pay only for the CU-seconds consumed.
                Costs scale with actual utilization rather than reserved capacity.
              </span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Average utilization (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={utilization}
                onChange={(e) => setUtilization(Math.min(100, Math.max(1, Number(e.target.value))))}
                className="w-32 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
              />
            </div>

            <div className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-950/20">
              <span className="text-xs text-blue-700 dark:text-blue-400">
                Est. autoscale cost
              </span>
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                ${autoscaleCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs font-normal"> /mo</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Potential savings</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                ${(reservedCost - autoscaleCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {' '}({Math.round(100 - utilization)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-[var(--text-tertiary)]">
        {status === 'live'
          ? 'Rates from Azure Retail Prices API (USD). Cached for 1 hour.'
          : 'Using estimated USD rates. Select a region for live pricing.'}
        {' '}Verify on the{' '}
        <a
          href="https://azure.microsoft.com/en-us/pricing/details/microsoft-fabric/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[var(--text-secondary)]"
        >
          Azure pricing page
        </a>.
      </p>
    </div>
  );
}

// --- Capacity Detail Panel ---

interface CapacityDetailProps {
  capacity: Capacity;
  workspaces: Workspace[];
  allItemsByWorkspace: Record<string, Item[]>;
}

function CapacityDetail({
  capacity,
  workspaces,
  allItemsByWorkspace,
}: CapacityDetailProps) {
  const navigate = useNavigate();
  const assigned = workspaces.filter((w) => w.capacityId === capacity.id);
  const totalItems = assigned.reduce(
    (sum, ws) => sum + (allItemsByWorkspace[ws.id]?.length ?? 0),
    0,
  );
  const spec = SKU_SPECS[capacity.sku];

  return (
    <tr>
      <td colSpan={5} className="bg-[var(--surface-secondary)] px-4 py-4">
        <div className="space-y-4">
          {/* SKU specs */}
          {spec && (
            <div className="flex items-center gap-4">
              <SkuBadge sku={capacity.sku} />
              <span className="text-sm text-[var(--text-secondary)]">
                {spec.cu} Capacity Units — ${spec.rate}/hr
              </span>
            </div>
          )}

          {/* Summary */}
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-[var(--text-secondary)]">Assigned workspaces: </span>
              <span className="font-medium text-[var(--text-primary)]">
                {assigned.length}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-secondary)]">Total items: </span>
              <span className="font-medium text-[var(--text-primary)]">
                {totalItems}
              </span>
            </div>
          </div>

          {/* Workspace list */}
          {assigned.length > 0 ? (
            <div className="rounded-md border border-[var(--border-default)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]">
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-[var(--text-secondary)]">
                      Workspace
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-[var(--text-secondary)]">
                      Items
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-[var(--text-secondary)]">
                      State
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {assigned.map((ws) => (
                    <tr
                      key={ws.id}
                      onClick={() => void navigate(`/workspaces/${ws.id}`)}
                      className="cursor-pointer hover:bg-[var(--surface-tertiary)]"
                    >
                      <td className="px-3 py-2 font-medium text-[var(--brand-primary)]">
                        {ws.displayName}
                      </td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">
                        {allItemsByWorkspace[ws.id]?.length ?? 0}
                      </td>
                      <td className="px-3 py-2">
                        <StateBadge state={ws.state} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)]">
              No workspaces assigned to this capacity.
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

// --- Main Page ---

export function CapacityPage() {
  const {
    capacities,
    loading: capLoading,
    error: capError,
    fetchCapacities,
  } = useCapacityStore();
  const {
    workspaces,
    allItemsByWorkspace,
    loading: wsLoading,
    fetchWorkspaces,
    fetchAllItems,
  } = useWorkspaceStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loading = capLoading || wsLoading;

  const loadData = useCallback(async () => {
    await Promise.all([fetchCapacities(), fetchWorkspaces()]);
    await fetchAllItems();
  }, [fetchCapacities, fetchWorkspaces, fetchAllItems]);

  useEffect(() => {
    if (capacities.length === 0) {
      void loadData();
    } else {
      if (workspaces.length === 0) void fetchWorkspaces();
      if (Object.keys(allItemsByWorkspace).length === 0) void fetchAllItems();
    }
  }, [capacities.length, workspaces.length, allItemsByWorkspace, loadData, fetchWorkspaces, fetchAllItems]);

  const handleExport = useCallback(() => {
    const rows: Record<string, unknown>[] = [];
    for (const cap of capacities) {
      const assigned = workspaces.filter((w) => w.capacityId === cap.id);
      if (assigned.length === 0) {
        rows.push({
          Capacity: cap.displayName,
          SKU: cap.sku,
          Region: cap.region,
          State: cap.state,
          Workspace: '',
          WorkspaceState: '',
          Items: 0,
        });
      } else {
        for (const ws of assigned) {
          rows.push({
            Capacity: cap.displayName,
            SKU: cap.sku,
            Region: cap.region,
            State: cap.state,
            Workspace: ws.displayName,
            WorkspaceState: ws.state,
            Items: allItemsByWorkspace[ws.id]?.length ?? 0,
          });
        }
      }
    }
    exportToCSV(rows, 'fabric-lens-capacities.csv');
  }, [capacities, workspaces, allItemsByWorkspace]);

  const workspaceCountByCapacity = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ws of workspaces) {
      if (ws.capacityId) {
        counts.set(ws.capacityId, (counts.get(ws.capacityId) ?? 0) + 1);
      }
    }
    return counts;
  }, [workspaces]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Capacities
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Monitor Fabric capacity usage and specifications.
          </p>
        </div>
        {capacities.length > 0 && (
          <ExportButton onClick={handleExport} label="Export CSV" />
        )}
      </div>

      {capError && (
        <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
          <span className="text-sm text-red-700 dark:text-red-400">
            Unable to load capacities. Please check your connection.
          </span>
          <button
            onClick={() => void loadData()}
            className="shrink-0 rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
          >
            Retry
          </button>
        </div>
      )}

      {/* Capacity table */}
      <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Workspaces
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] bg-[var(--surface-primary)]">
              {loading && capacities.length === 0 &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--surface-secondary)]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && capacities.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[var(--text-secondary)]"
                  >
                    No capacities found.
                  </td>
                </tr>
              )}

              {capacities.map((cap) => {
                const isExpanded = expandedId === cap.id;
                return (
                  <>
                    <tr
                      key={cap.id}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : cap.id)
                      }
                      className="cursor-pointer hover:bg-[var(--surface-tertiary)]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                          )}
                          <span className="font-medium text-[var(--text-primary)]">
                            {cap.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <SkuBadge sku={cap.sku} />
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {cap.region}
                      </td>
                      <td className="px-4 py-3">
                        <StateBadge state={cap.state} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                          <span className="text-[var(--text-secondary)]">
                            {workspaceCountByCapacity.get(cap.id) ?? 0}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <CapacityDetail
                        key={`${cap.id}-detail`}
                        capacity={cap}
                        workspaces={workspaces}
                        allItemsByWorkspace={allItemsByWorkspace}
                      />
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && capacities.length > 0 && (
          <div className="border-t border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-2">
            <span className="text-xs text-[var(--text-secondary)]">
              {capacities.length} {capacities.length === 1 ? 'capacity' : 'capacities'}
            </span>
          </div>
        )}
      </div>

      {/* Cost Calculator */}
      <CostCalculator />
    </div>
  );
}
