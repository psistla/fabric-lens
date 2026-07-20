import { describe, it, expect } from 'vitest';
import { groupSecurityAreas } from '../securityAreas';
import type { SecurityFinding } from '../securityFindings';

function finding(id: string): SecurityFinding {
  return {
    id,
    severity: 'warning',
    title: id,
    detail: id,
    affectedItems: [],
  };
}

const EMPTY = {
  findings: [],
  overPermissionedCount: 0,
  spofCount: 0,
  spnElevatedCount: 0,
  riskySettingsCount: 0,
  widelySharedCount: 0,
  unassignedDomainCount: 0,
  ghostCount: 0,
};

describe('groupSecurityAreas', () => {
  it('returns the four areas in a stable order even when everything is clean', () => {
    const areas = groupSecurityAreas(EMPTY);
    expect(areas.map((a) => a.id)).toEqual([
      'access',
      'sharing',
      'settings',
      'lifecycle',
    ]);
    expect(areas.every((a) => a.count === 0)).toBe(true);
  });

  it('routes each signal count to its own area', () => {
    const areas = groupSecurityAreas({
      ...EMPTY,
      overPermissionedCount: 2,
      spofCount: 3,
      spnElevatedCount: 1,
      widelySharedCount: 4,
      unassignedDomainCount: 5,
      riskySettingsCount: 6,
      ghostCount: 7,
    });
    const byId = Object.fromEntries(areas.map((a) => [a.id, a]));

    expect(byId.access.count).toBe(6); // 2 + 3 + 1
    expect(byId.sharing.count).toBe(9); // 4 + 5
    expect(byId.settings.count).toBe(6);
    expect(byId.lifecycle.count).toBe(7);
  });

  it('lists member signals with their own counts', () => {
    const areas = groupSecurityAreas({ ...EMPTY, spofCount: 3 });
    const access = areas.find((a) => a.id === 'access');
    expect(access?.signals).toContainEqual(
      expect.objectContaining({ key: 'spof', count: 3 }),
    );
  });

  it('routes findings to the area their rule belongs to', () => {
    // Every rule `deriveSecurityFindings` ships today is an access-control rule,
    // so they all land in Access and the other areas stay empty.
    const areas = groupSecurityAreas({
      ...EMPTY,
      findings: [finding('spof-single-admin'), finding('over-permissioned-users')],
    });
    const byId = Object.fromEntries(areas.map((a) => [a.id, a]));

    expect(byId.access.findingIds).toEqual([
      'spof-single-admin',
      'over-permissioned-users',
    ]);
    expect(byId.sharing.findingIds).toEqual([]);
    expect(byId.settings.findingIds).toEqual([]);
    expect(byId.lifecycle.findingIds).toEqual([]);
  });

  it('sends an unrecognized finding to access rather than dropping it', () => {
    const areas = groupSecurityAreas({
      ...EMPTY,
      findings: [finding('some-future-rule')],
    });
    const access = areas.find((a) => a.id === 'access');
    expect(access?.findingIds).toEqual(['some-future-rule']);
  });

  it('keeps findings out of the headline count, which measures signals', () => {
    const areas = groupSecurityAreas({
      ...EMPTY,
      findings: [finding('spof-single-admin')],
    });
    const access = areas.find((a) => a.id === 'access');
    expect(access?.count).toBe(0);
  });
});
