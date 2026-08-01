// ---------------------------------------------------------------------------
// Microsoft Fabric SKU specifications.
//
// Every F-SKU is priced as (capacity units x the region's CU-hour rate), so one
// number per region prices the whole ladder. Rates come from a build-time
// snapshot of the Azure Retail Prices API (see scripts/fetch-pricing.mjs);
// CU_RATE_PER_HOUR covers any region missing from that snapshot.
// ---------------------------------------------------------------------------

import { CU_RATE_PER_HOUR } from '@/utils/constants';
import { CU_RATE_BY_REGION } from '@/data/regionRates.generated';

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

/** Ordered SKU names for dropdowns and iteration. */
export const SKU_NAMES = SKU_CU_VALUES.map((cu) => `F${cu}`);

/** Tailwind classes for each tier — used by SkuBadge. */
export const SKU_TIER_STYLES: Record<SkuTier, string> = {
  gray:   'bg-[var(--m-surface)] text-[var(--m-text-secondary)]',
  blue:   'bg-[var(--m-primary-subtle)] text-[var(--m-primary)]',
  indigo: 'bg-[var(--m-primary-subtle)] text-[var(--m-primary)]',
  purple: 'bg-[var(--item-notebook-bg)] text-[var(--item-notebook)]',
};

// ---------------------------------------------------------------------------
// Regional pricing
// ---------------------------------------------------------------------------

/**
 * Fabric reports a capacity's region as a display name ('West US'); the pricing
 * snapshot is keyed by ARM name ('westus'). Lowercasing and dropping spaces
 * converts one to the other, and leaves an already-ARM name untouched.
 */
export function normalizeRegion(region: string): string {
  return region.toLowerCase().replace(/\s+/g, '');
}

/** USD per capacity unit per hour for a region, falling back to the base rate. */
export function cuRateForRegion(region?: string): number {
  if (!region) return CU_RATE_PER_HOUR;
  return CU_RATE_BY_REGION[normalizeRegion(region)] ?? CU_RATE_PER_HOUR;
}

/**
 * SKU specs priced for one region. Every cost surface derives from this, so the
 * headline run rate and the calculator cannot quote different money for the
 * same SKU.
 */
export function specsForRegion(region?: string): Record<string, SkuSpec> {
  const cuRate = cuRateForRegion(region);
  return Object.fromEntries(
    SKU_CU_VALUES.map((cu) => [
      `F${cu}`,
      { cu, rate: +(cu * cuRate).toFixed(2), tier: tierForCu(cu) },
    ]),
  );
}

/** Base-rate specs, for the CU counts and tiers where price is irrelevant. */
export const SKU_SPECS: Record<string, SkuSpec> = specsForRegion();

// ---------------------------------------------------------------------------
// Region picker
// ---------------------------------------------------------------------------

export interface AzureRegion {
  name: string;
  displayName: string;
}

/** Curated list of popular Azure regions (sorted geographically). */
export const AZURE_REGIONS: AzureRegion[] = [
  // Americas
  { name: 'eastus', displayName: 'East US' },
  { name: 'eastus2', displayName: 'East US 2' },
  { name: 'centralus', displayName: 'Central US' },
  { name: 'westus', displayName: 'West US' },
  { name: 'westus2', displayName: 'West US 2' },
  { name: 'westus3', displayName: 'West US 3' },
  { name: 'southcentralus', displayName: 'South Central US' },
  { name: 'canadacentral', displayName: 'Canada Central' },
  { name: 'brazilsouth', displayName: 'Brazil South' },
  // Europe
  { name: 'northeurope', displayName: 'North Europe' },
  { name: 'westeurope', displayName: 'West Europe' },
  { name: 'uksouth', displayName: 'UK South' },
  { name: 'ukwest', displayName: 'UK West' },
  { name: 'francecentral', displayName: 'France Central' },
  { name: 'germanywestcentral', displayName: 'Germany West Central' },
  { name: 'swedencentral', displayName: 'Sweden Central' },
  { name: 'norwayeast', displayName: 'Norway East' },
  { name: 'switzerlandnorth', displayName: 'Switzerland North' },
  // Asia Pacific
  { name: 'eastasia', displayName: 'East Asia' },
  { name: 'southeastasia', displayName: 'Southeast Asia' },
  { name: 'japaneast', displayName: 'Japan East' },
  { name: 'australiaeast', displayName: 'Australia East' },
  { name: 'koreacentral', displayName: 'Korea Central' },
  { name: 'centralindia', displayName: 'Central India' },
  // Middle East & Africa
  { name: 'uaenorth', displayName: 'UAE North' },
  { name: 'southafricanorth', displayName: 'South Africa North' },
];
