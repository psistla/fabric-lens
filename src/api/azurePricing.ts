// ---------------------------------------------------------------------------
// Azure Retail Prices API — fetches live Fabric SKU pricing by region.
// Public API, no authentication required.
// https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices
// ---------------------------------------------------------------------------

import type {
  AzurePricingResponse,
  AzurePriceItem,
  SkuRate,
} from '@/api/types/pricing';
import { SKU_NAMES } from '@/data/skuSpecs';

const PRICING_API_BASE = 'https://prices.azure.com/api/retail/prices';

// ---------------------------------------------------------------------------
// API fetching
// ---------------------------------------------------------------------------

/**
 * Fetch all Consumption-type Fabric pricing items for a given Azure region.
 * Always fetches in USD for simplicity and consistency.
 * Handles pagination automatically via NextPageLink.
 */
async function fetchPricingItems(
  armRegionName: string,
): Promise<AzurePriceItem[]> {
  const filter = [
    `serviceName eq 'Microsoft Fabric'`,
    `armRegionName eq '${armRegionName}'`,
    `priceType eq 'Consumption'`,
  ].join(' and ');

  const items: AzurePriceItem[] = [];
  let url: string | null =
    `${PRICING_API_BASE}?currencyCode=USD&$filter=${encodeURIComponent(filter)}`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Azure Pricing API returned ${res.status}`);
    }
    const data: AzurePricingResponse = await res.json();
    items.push(...data.Items);
    url = data.NextPageLink;
  }

  return items;
}

/**
 * Extract per-SKU hourly rates from raw pricing items.
 * Matches only F-SKU names (F2, F4 … F2048) that we support.
 */
function extractSkuRates(
  items: AzurePriceItem[],
): SkuRate[] {
  const skuSet = new Set(SKU_NAMES);
  const rateMap = new Map<string, SkuRate>();

  for (const item of items) {
    const sku = item.armSkuName || item.skuName;
    if (!skuSet.has(sku)) continue;
    // Prefer "1 Hour" meter; skip reservation-type rows
    if (item.unitOfMeasure !== '1 Hour') continue;
    // Keep the first (primary) entry per SKU
    if (rateMap.has(sku)) continue;

    rateMap.set(sku, {
      sku,
      retailPrice: item.retailPrice,
      currencyCode: item.currencyCode,
      region: item.armRegionName,
      location: item.location,
    });
  }

  return [...rateMap.values()];
}

// ---------------------------------------------------------------------------
// In-memory cache  (region → { rates, fetchedAt })
// ---------------------------------------------------------------------------

interface CacheEntry {
  rates: SkuRate[];
  fetchedAt: number;
}

/** Cache TTL — 1 hour (pricing rarely changes intra-day). */
const CACHE_TTL_MS = 60 * 60 * 1000;

const cache = new Map<string, CacheEntry>();

/**
 * Fetch Fabric SKU rates for a region in USD (with cache).
 * Returns an empty array on error so callers can gracefully fall back.
 */
export async function fetchSkuRates(
  armRegionName: string,
): Promise<SkuRate[]> {
  const cached = cache.get(armRegionName);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates;
  }

  const items = await fetchPricingItems(armRegionName);
  const rates = extractSkuRates(items);
  cache.set(armRegionName, { rates, fetchedAt: Date.now() });
  return rates;
}

// ---------------------------------------------------------------------------
// Common Azure regions for the region picker
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
