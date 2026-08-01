import { describe, it, expect } from 'vitest';
import {
  normalizeRegion,
  cuRateForRegion,
  specsForRegion,
  SKU_NAMES,
  AZURE_REGIONS,
} from '@/data/skuSpecs';
import { CU_RATE_BY_REGION } from '@/data/regionRates.generated';
import { CU_RATE_PER_HOUR } from '@/utils/constants';

describe('normalizeRegion', () => {
  it('converts the display names the Fabric API returns to ARM names', () => {
    expect(normalizeRegion('West US')).toBe('westus');
    expect(normalizeRegion('North Europe')).toBe('northeurope');
    expect(normalizeRegion('South Central US')).toBe('southcentralus');
  });

  it('leaves an ARM name untouched', () => {
    expect(normalizeRegion('eastus')).toBe('eastus');
  });
});

describe('cuRateForRegion', () => {
  it('reads the snapshot rate for a known region, in either name form', () => {
    expect(cuRateForRegion('eastus')).toBe(CU_RATE_BY_REGION.eastus);
    expect(cuRateForRegion('East US')).toBe(CU_RATE_BY_REGION.eastus);
  });

  it('falls back to the base rate for an unknown or missing region', () => {
    expect(cuRateForRegion('mars-central')).toBe(CU_RATE_PER_HOUR);
    expect(cuRateForRegion(undefined)).toBe(CU_RATE_PER_HOUR);
  });
});

describe('specsForRegion', () => {
  it('prices every SKU as capacity units times the region rate', () => {
    const specs = specsForRegion('eastus');
    const rate = CU_RATE_BY_REGION.eastus;
    for (const name of SKU_NAMES) {
      expect(specs[name].rate).toBeCloseTo(specs[name].cu * rate, 2);
    }
  });

  it('prices the same SKU differently in a more expensive region', () => {
    // Guards the whole point of the regional table: a flat rate would tie these.
    expect(specsForRegion('brazilsouth').F64.rate).toBeGreaterThan(
      specsForRegion('eastus').F64.rate,
    );
  });
});

describe('pricing snapshot', () => {
  it('covers every region offered in the picker', () => {
    const missing = AZURE_REGIONS.filter((r) => !(r.name in CU_RATE_BY_REGION));
    expect(missing).toEqual([]);
  });

  it('has a display name that normalizes back to its ARM name', () => {
    const mismatched = AZURE_REGIONS.filter(
      (r) => normalizeRegion(r.displayName) !== r.name,
    );
    expect(mismatched).toEqual([]);
  });
});
