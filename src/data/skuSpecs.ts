// ---------------------------------------------------------------------------
// Microsoft Fabric SKU specifications
// Rates are derived from a single base rate (CU_RATE_PER_HOUR) so updates
// only require changing one constant in src/utils/constants.ts.
// Live region-specific rates can override defaults via buildSkuSpecsWithRates().
// ---------------------------------------------------------------------------

import { CU_RATE_PER_HOUR } from '@/utils/constants';
import type { SkuRate } from '@/api/types/pricing';

export type SkuTier = 'gray' | 'blue' | 'indigo' | 'purple';

export interface SkuSpec {
  cu: number;
  rate: number;
  tier: SkuTier;
}

/** Tier thresholds — determines visual badge color per CU count. */
function tierForCu(cu: number): SkuTier {
  if (cu <= 2) return 'gray';
  if (cu <= 16) return 'blue';
  if (cu <= 128) return 'indigo';
  return 'purple';
}

/** Ordered list of Fabric F-SKU capacity unit counts. */
const SKU_CU_VALUES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048] as const;

/** Full SKU specification map keyed by SKU name — uses default base rate. */
export const SKU_SPECS: Record<string, SkuSpec> = Object.fromEntries(
  SKU_CU_VALUES.map((cu) => [
    `F${cu}`,
    {
      cu,
      rate: +(cu * CU_RATE_PER_HOUR).toFixed(2),
      tier: tierForCu(cu),
    },
  ]),
);

/** Ordered SKU names for dropdowns and iteration. */
export const SKU_NAMES = SKU_CU_VALUES.map((cu) => `F${cu}`);

/** Tailwind classes for each tier — used by SkuBadge. */
export const SKU_TIER_STYLES: Record<SkuTier, string> = {
  gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

// ---------------------------------------------------------------------------
// Dynamic rate overlay — merges live API prices onto the defaults
// ---------------------------------------------------------------------------

/**
 * Build an SKU spec map that overlays live region-specific rates onto the
 * default specs.  Any SKU not present in `liveRates` keeps its default rate.
 */
export function buildSkuSpecsWithRates(
  liveRates: SkuRate[],
): Record<string, SkuSpec> {
  const rateMap = new Map(liveRates.map((r) => [r.sku, r.retailPrice]));

  return Object.fromEntries(
    SKU_CU_VALUES.map((cu) => {
      const name = `F${cu}`;
      const liveRate = rateMap.get(name);
      return [
        name,
        {
          cu,
          rate: liveRate != null ? +liveRate.toFixed(2) : +(cu * CU_RATE_PER_HOUR).toFixed(2),
          tier: tierForCu(cu),
        },
      ];
    }),
  );
}
