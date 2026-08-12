import { describe, it, expect } from 'vitest';
import { itemTypeToken } from '../constants';

// The matching --item-* tokens are checked against index.css by
// `npm run docs:check`; Vitest cannot read the stylesheet.
describe('itemTypeToken', () => {
  it('maps known workloads to a color token by family', () => {
    expect(itemTypeToken('Lakehouse')).toBe('lakehouse');
    expect(itemTypeToken('Report')).toBe('report');
    expect(itemTypeToken('DataAgent')).toBe('ai');
    expect(itemTypeToken('Eventhouse')).toBe('rti');
    expect(itemTypeToken('AppBackend')).toBe('platform');
  });

  it('gives real-time intelligence its own family, not warehouse', () => {
    // The whole point of the split: an Eventstream must not look like a Warehouse.
    expect(itemTypeToken('Eventstream')).not.toBe(itemTypeToken('Warehouse'));
    expect(itemTypeToken('KQLDashboard')).not.toBe(itemTypeToken('Dashboard'));
    expect(itemTypeToken('MLModel')).not.toBe(itemTypeToken('Notebook'));
  });

  it('falls back to default (gray) only for types outside the union', () => {
    expect(itemTypeToken('SomeWorkloadShippedNextYear')).toBe('default');
  });
});
