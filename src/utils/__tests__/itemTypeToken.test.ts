import { describe, it, expect } from 'vitest';
import { itemTypeToken } from '../constants';

describe('itemTypeToken', () => {
  it('maps known workloads to a color token by family', () => {
    expect(itemTypeToken('Lakehouse')).toBe('lakehouse');
    expect(itemTypeToken('Report')).toBe('report');
    // newer GA workloads resolve to a family token, not gray
    expect(itemTypeToken('DataAgent')).toBe('notebook');
    expect(itemTypeToken('Eventhouse')).toBe('warehouse');
  });

  it('falls back to default (gray) for unmapped / future types', () => {
    expect(itemTypeToken('AppBackend')).toBe('default');
    expect(itemTypeToken('SomeWorkloadShippedNextYear')).toBe('default');
  });
});
