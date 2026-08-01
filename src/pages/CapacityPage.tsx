import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Calculator,
  Info,
} from 'lucide-react';
import { useCapacityStore } from '@/store/capacityStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { StateBadge } from '@/components/shared/StateBadge';
import { ExportButton } from '@/components/shared/ExportButton';
import { exportToCSV } from '@/utils/export';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { HOURS_PER_MONTH } from '@/utils/constants';
import {
  SKU_SPECS,
  SKU_NAMES,
  SKU_TIER_STYLES,
  AZURE_REGIONS,
  specsForRegion,
  normalizeRegion,
} from '@/data/skuSpecs';
import { PRICING_FETCHED_ON } from '@/data/regionRates.generated';
import type { Capacity } from '@/api/types/capacity';
import type { Item } from '@/api/types/item';
import type { Workspace } from '@/api/types/workspace';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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

interface CostCalculatorProps {
  /** Region and SKU of the tenant's largest active capacity, when there is one. */
  initialRegion: string;
  initialSku: string;
}

function CostCalculator({ initialRegion, initialSku }: CostCalculatorProps) {
  const [region, setRegion] = useState(initialRegion);
  const [sku, setSku] = useState(initialSku);
  const [hoursPerDay, setHoursPerDay] = useState(24);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [showAutoscale, setShowAutoscale] = useState(false);
  const [utilization, setUtilization] = useState(40);

  const specs = useMemo(() => specsForRegion(region), [region]);

  // A capacity can sit in a region outside the curated list. Prepend it rather
  // than let the select fall through to a blank value.
  const regionOptions = useMemo(
    () =>
      AZURE_REGIONS.some((r) => r.name === region)
        ? AZURE_REGIONS
        : [{ name: region, displayName: region }, ...AZURE_REGIONS],
    [region],
  );

  const spec = specs[sku];
  const reservedCost = spec ? spec.rate * hoursPerDay * daysPerMonth : 0;
  const autoscaleCost = reservedCost * (utilization / 100);

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-5">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-[var(--m-text-secondary)]" />
        <h2 className="text-sm font-medium text-[var(--m-text)]">
          Cost Calculator
        </h2>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Region select */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--m-text-secondary)]">
            Region
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-1.5 text-sm text-[var(--m-text)]"
          >
            {regionOptions.map((r) => (
              <option key={r.name} value={r.name}>
                {r.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* SKU select */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--m-text-secondary)]">
            SKU
          </label>
          <select
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-1.5 text-sm text-[var(--m-text)]"
          >
            {SKU_NAMES.map((s) => (
              <option key={s} value={s}>
                {s}: {specs[s].cu} CUs · ${specs[s].rate.toFixed(2)}/hr
              </option>
            ))}
          </select>
        </div>

        {/* Hours per day */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--m-text-secondary)]">
            Hours / day
          </label>
          <input
            type="number"
            min={1}
            max={24}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, Number(e.target.value))))}
            className="w-full rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-1.5 text-sm text-[var(--m-text)]"
          />
        </div>

        {/* Days per month */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--m-text-secondary)]">
            Days / month
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={daysPerMonth}
            onChange={(e) => setDaysPerMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
            className="w-full rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-1.5 text-sm text-[var(--m-text)]"
          />
        </div>
      </div>

      {/* Result */}
      <div className="mt-4 rounded-lg bg-[var(--m-surface)] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--m-text-secondary)]">
            Reserved (always-on)
          </span>
          <span className="text-lg font-semibold text-[var(--m-text)]">
            ${reservedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal text-[var(--m-text-secondary)]"> /mo</span>
          </span>
        </div>
      </div>

      {/* Autoscale toggle */}
      <div className="mt-3">
        <button
          onClick={() => setShowAutoscale(!showAutoscale)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--m-primary)]"
        >
          {showAutoscale ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Spark Autoscale Billing
        </button>

        {showAutoscale && (
          <div className="mt-3 space-y-3 rounded-lg border border-[var(--m-border)] p-3">
            <div className="flex items-start gap-2 text-xs text-[var(--m-text-secondary)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--m-info)]" />
              <span>
                With Spark Autoscale you pay only for the CU-seconds consumed, so
                cost scales with utilization rather than reserved capacity. This
                models a figure you supply. Actual CU consumption is not available
                from the Fabric REST APIs; the Fabric Capacity Metrics app reports it.
              </span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--m-text-secondary)]">
                Assumed average utilization (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={utilization}
                onChange={(e) => setUtilization(Math.min(100, Math.max(1, Number(e.target.value))))}
                className="w-32 rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] px-3 py-1.5 text-sm text-[var(--m-text)]"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[var(--m-info-bg)] px-3 py-2">
              <span className="text-xs text-[var(--m-info-text)]">
                Modelled autoscale cost
              </span>
              <span className="text-sm font-semibold text-[var(--m-info-text)]">
                ${autoscaleCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs font-normal"> /mo</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--m-text-secondary)]">
              <span>Modelled savings</span>
              <span className="font-semibold text-[var(--m-success)]">
                ${(reservedCost - autoscaleCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {' '}({Math.round(100 - utilization)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-[var(--m-text-tertiary)]">
        Azure retail list price in USD, snapshot taken {PRICING_FETCHED_ON}.
        Pay-as-you-go only, before any reservation or discount. Verify on the{' '}
        <a
          href="https://azure.microsoft.com/en-us/pricing/details/microsoft-fabric/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[var(--m-text-secondary)]"
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
  const spec = specsForRegion(capacity.region)[capacity.sku];

  return (
    <tr>
      <td colSpan={5} className="bg-[var(--m-surface)] px-4 py-4">
        <div className="space-y-4">
          {/* SKU specs */}
          {spec && (
            <div className="flex items-center gap-4">
              <SkuBadge sku={capacity.sku} />
              <span className="text-sm text-[var(--m-text-secondary)]">
                {spec.cu} Capacity Units · ${spec.rate.toFixed(2)}/hr in {capacity.region}
              </span>
            </div>
          )}

          {/* Summary */}
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-[var(--m-text-secondary)]">Assigned workspaces: </span>
              <span className="font-medium text-[var(--m-text)]">
                {assigned.length}
              </span>
            </div>
            <div>
              <span className="text-[var(--m-text-secondary)]">Total items: </span>
              <span className="font-medium text-[var(--m-text)]">
                {totalItems}
              </span>
            </div>
          </div>

          {/* Workspace list */}
          {assigned.length > 0 ? (
            <div className="rounded-lg border border-[var(--m-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
                    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                      Workspace
                    </th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                      Items
                    </th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                      State
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--m-border)]">
                  {assigned.map((ws) => (
                    <tr
                      key={ws.id}
                      onClick={() => void navigate(`/workspaces/${ws.id}`)}
                      className="cursor-pointer hover:bg-[var(--m-surface-hover)]"
                    >
                      <td className="px-4 py-2.5 font-medium text-[var(--m-primary)]">
                        {ws.displayName}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                        {allItemsByWorkspace[ws.id]?.length ?? 0}
                      </td>
                      <td className="px-4 py-2.5">
                        <StateBadge state={ws.state} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[var(--m-text-tertiary)]">
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
  useDocumentTitle('Capacity');
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

  // Headline cost: active capacities only, each at its own region's list rate for
  // a full month. Paused capacities bill nothing, so they are left out.
  const { activeCount, monthlyRunRate } = useMemo(() => {
    const active = capacities.filter((c) => c.state === 'Active');
    const hourly = active.reduce(
      (sum, c) => sum + (specsForRegion(c.region)[c.sku]?.rate ?? 0),
      0,
    );
    return { activeCount: active.length, monthlyRunRate: hourly * HOURS_PER_MONTH };
  }, [capacities]);

  // Open the calculator on the tenant's own largest active capacity. Modelling
  // an F64 in East US for someone running one F8 in UK South is a worse starting
  // point than no default at all.
  const { defaultRegion, defaultSku } = useMemo(() => {
    const largest = capacities
      .filter((c) => c.state === 'Active' && SKU_SPECS[c.sku])
      .reduce<Capacity | null>(
        (max, c) =>
          !max || SKU_SPECS[c.sku].cu > SKU_SPECS[max.sku].cu ? c : max,
        null,
      );
    return {
      defaultRegion: largest ? normalizeRegion(largest.region) : 'eastus',
      defaultSku: largest ? largest.sku : 'F64',
    };
  }, [capacities]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--m-text)]">
            Capacities
          </h1>
          <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
            {capacities.length > 0
              ? `${activeCount} active, ${capacities.length - activeCount} paused, about $${monthlyRunRate.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo at list price if run 24/7.`
              : 'Monitor Fabric capacity usage and specifications.'}
          </p>
        </div>
        {capacities.length > 0 && (
          <ExportButton onClick={handleExport} label="Export CSV" />
        )}
      </div>

      {capError && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--m-error)] bg-[var(--m-error-bg)] px-4 py-3">
          <span className="text-sm text-[var(--m-error-text)]">
            Unable to load capacities. Please check your connection.
          </span>
          <button
            onClick={() => void loadData()}
            className="shrink-0 rounded-lg bg-[var(--m-error-bg)] px-3 py-1 text-xs font-semibold text-[var(--m-error-text)] ring-1 ring-[var(--m-error)] transition-colors hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Capacity table */}
      <div className="overflow-hidden rounded-xl border border-[var(--m-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  State
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Workspaces
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--m-border)] bg-[var(--m-bg)]">
              {loading && capacities.length === 0 &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="m-skeleton h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && capacities.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[var(--m-text-secondary)]"
                  >
                    No capacities found.
                  </td>
                </tr>
              )}

              {capacities.map((cap) => {
                const isExpanded = expandedId === cap.id;
                return (
                  <Fragment key={cap.id}>
                    <tr
                      onClick={() =>
                        setExpandedId(isExpanded ? null : cap.id)
                      }
                      className="cursor-pointer hover:bg-[var(--m-surface-hover)]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-[var(--m-text-tertiary)]" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-[var(--m-text-tertiary)]" />
                          )}
                          <span className="font-medium text-[var(--m-text)]">
                            {cap.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <SkuBadge sku={cap.sku} />
                      </td>
                      <td className="px-4 py-3 text-[var(--m-text-secondary)]">
                        {cap.region}
                      </td>
                      <td className="px-4 py-3">
                        <StateBadge state={cap.state} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-[var(--m-text-tertiary)]" />
                          <span className="text-[var(--m-text-secondary)]">
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
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && capacities.length > 0 && (
          <div className="border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2">
            <span className="text-xs text-[var(--m-text-secondary)]">
              {capacities.length} {capacities.length === 1 ? 'capacity' : 'capacities'}
            </span>
          </div>
        )}
      </div>

      {/* Cost modelling is a what-if tool, not a status readout, so it opens on
          request rather than competing with the capacity list. */}
      <CollapsibleSection
        title="Cost calculator"
        description="Model a SKU against hours, days, and autoscale."
      >
        {/* Remount when the defaults resolve, so the inputs pick up the tenant's
            own capacity once it has loaded. */}
        <CostCalculator
          key={`${defaultRegion}-${defaultSku}`}
          initialRegion={defaultRegion}
          initialSku={defaultSku}
        />
      </CollapsibleSection>
    </div>
  );
}
