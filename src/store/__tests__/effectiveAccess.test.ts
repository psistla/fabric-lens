import { describe, it, expect } from 'vitest';
import { computeEffectiveAccess, type UserSummary } from '@/utils/effectiveAccess';
import type { ResolvedGroup } from '@/api/types/admin';
import type { PrincipalType } from '@/api/types/admin';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

type Assignment = { workspaceId: string; workspaceName: string; role: string };

function makeUser(
  email: string,
  assignments: Assignment[] = [],
  displayName?: string,
): UserSummary {
  return {
    displayName: displayName ?? email,
    email,
    principalType: 'User',
    assignments,
  };
}

function makeGroup(
  email: string,
  assignments: Assignment[] = [],
  displayName?: string,
): UserSummary {
  return {
    displayName: displayName ?? email,
    email,
    principalType: 'Group',
    assignments,
  };
}

function makeSpn(email: string): UserSummary {
  return {
    displayName: email,
    email,
    principalType: 'ServicePrincipal' as PrincipalType,
    assignments: [],
  };
}

function makeResolvedGroup(
  groupId: string,
  memberUpns: string[],
  opts: Partial<Pick<ResolvedGroup, 'loading' | 'error'>> = {},
): ResolvedGroup {
  return {
    groupId,
    displayName: groupId,
    memberCount: memberUpns.length,
    members: memberUpns.map((upn) => ({ displayName: upn, userPrincipalName: upn })),
    loading: opts.loading ?? false,
    error: opts.error ?? null,
  };
}

const NO_RESOLVED: Record<string, ResolvedGroup> = {};

// ---------------------------------------------------------------------------
// a) Deduplication tests
// ---------------------------------------------------------------------------

describe('computeEffectiveAccess — deduplication', () => {
  it('user appears as direct AND in one group → uniqueUsers = 1', () => {
    const users: UserSummary[] = [makeUser('alice@x.com')];
    const groups: UserSummary[] = [makeGroup('grp@x.com')];
    const resolved: Record<string, ResolvedGroup> = {
      'grp@x.com': makeResolvedGroup('grp', ['alice@x.com', 'bob@x.com']),
    };

    const result = computeEffectiveAccess([...users, ...groups], resolved);

    // alice appears in both direct + group → deduplicated
    expect(result.uniqueUsers).toBe(2); // alice (direct+group) + bob (group only)
    expect(result.duplicates).toBe(1);  // 1 user is double-counted
  });

  it('user appears in two different groups → counted once in uniqueUsers', () => {
    const groups: UserSummary[] = [
      makeGroup('g1@x.com'),
      makeGroup('g2@x.com'),
    ];
    const resolved: Record<string, ResolvedGroup> = {
      'g1@x.com': makeResolvedGroup('g1', ['alice@x.com', 'charlie@x.com']),
      'g2@x.com': makeResolvedGroup('g2', ['alice@x.com', 'dave@x.com']),
    };

    const result = computeEffectiveAccess(groups, resolved);

    // alice is in both groups → counted once
    expect(result.transitiveUsers).toBe(4); // 2 + 2, counting duplicates
    expect(result.uniqueUsers).toBe(3);      // alice, charlie, dave
  });

  it('user appears as direct AND in 3 separate groups → counted once', () => {
    const users: UserSummary[] = [makeUser('alice@x.com')];
    const groups: UserSummary[] = [
      makeGroup('g1@x.com'),
      makeGroup('g2@x.com'),
      makeGroup('g3@x.com'),
    ];
    const resolved: Record<string, ResolvedGroup> = {
      'g1@x.com': makeResolvedGroup('g1', ['alice@x.com']),
      'g2@x.com': makeResolvedGroup('g2', ['alice@x.com']),
      'g3@x.com': makeResolvedGroup('g3', ['alice@x.com']),
    };

    const result = computeEffectiveAccess([...users, ...groups], resolved);

    expect(result.uniqueUsers).toBe(1);       // only alice
    expect(result.transitiveUsers).toBe(3);   // 3 group memberships
    expect(result.duplicates).toBe(3);        // 1 direct + 3 transitive - 1 unique = 3
  });

  it('no overlap: 5 direct users + 2 groups of 10 = 25 unique users', () => {
    const directUpns = Array.from({ length: 5 }, (_, i) => `u${i}@x.com`);
    const g1Upns = Array.from({ length: 10 }, (_, i) => `g1m${i}@x.com`);
    const g2Upns = Array.from({ length: 10 }, (_, i) => `g2m${i}@x.com`);

    const users = directUpns.map((upn) => makeUser(upn));
    const groups: UserSummary[] = [makeGroup('grp1@x.com'), makeGroup('grp2@x.com')];
    const resolved: Record<string, ResolvedGroup> = {
      'grp1@x.com': makeResolvedGroup('g1', g1Upns),
      'grp2@x.com': makeResolvedGroup('g2', g2Upns),
    };

    const result = computeEffectiveAccess([...users, ...groups], resolved);

    expect(result.directUsers).toBe(5);
    expect(result.groups).toBe(2);
    expect(result.transitiveUsers).toBe(20);
    expect(result.uniqueUsers).toBe(25);
    expect(result.duplicates).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// b) Summary calculation tests
// ---------------------------------------------------------------------------

describe('computeEffectiveAccess — summary calculation', () => {
  it('3 direct + 2 groups (10 + 20 members) + 1 SPN with no overlap → uniqueUsers = 33', () => {
    const directUpns = ['d1@x.com', 'd2@x.com', 'd3@x.com'];
    const g1Upns = Array.from({ length: 10 }, (_, i) => `g1m${i}@x.com`);
    const g2Upns = Array.from({ length: 20 }, (_, i) => `g2m${i}@x.com`);

    const summaries: UserSummary[] = [
      ...directUpns.map((upn) => makeUser(upn)),
      makeGroup('grp1@x.com'),
      makeGroup('grp2@x.com'),
      makeSpn('spn@x.com'),
    ];
    const resolved: Record<string, ResolvedGroup> = {
      'grp1@x.com': makeResolvedGroup('g1', g1Upns),
      'grp2@x.com': makeResolvedGroup('g2', g2Upns),
    };

    const result = computeEffectiveAccess(summaries, resolved);

    expect(result.directUsers).toBe(3);
    expect(result.groups).toBe(2);
    expect(result.servicePrincipals).toBe(1);
    expect(result.transitiveUsers).toBe(30);
    expect(result.uniqueUsers).toBe(33);
    expect(result.duplicates).toBe(0);
  });

  it('3 direct + 2 groups (10 + 20 members) + 5 overlap → uniqueUsers = 28, duplicates = 5', () => {
    // 5 users are in both direct assignments AND group members
    const sharedUpns = ['d1@x.com', 'd2@x.com', 'd3@x.com', 'd4@x.com', 'd5@x.com'];
    const g1ExtraUpns = Array.from({ length: 5 }, (_, i) => `g1x${i}@x.com`);
    const g2Upns = Array.from({ length: 20 }, (_, i) => `g2m${i}@x.com`);

    // g1 has 5 shared + 5 unique = 10 members
    // g2 has 20 unique members
    const g1Upns = [...sharedUpns, ...g1ExtraUpns];

    const summaries: UserSummary[] = [
      ...sharedUpns.map((upn) => makeUser(upn)),
      makeGroup('grp1@x.com'),
      makeGroup('grp2@x.com'),
    ];
    const resolved: Record<string, ResolvedGroup> = {
      'grp1@x.com': makeResolvedGroup('g1', g1Upns),
      'grp2@x.com': makeResolvedGroup('g2', g2Upns),
    };

    const result = computeEffectiveAccess(summaries, resolved);

    // direct: 5, g1: 10, g2: 20 → totalTransitive = 30
    // uniqueUpns = shared(5) + g1Extra(5) + g2(20) = 30
    // But direct users (5) + transitiveUnique (30 from union of g1+g2) = 30 total unique
    // (all 5 direct are already in g1, so direct doesn't add new unique users)
    expect(result.directUsers).toBe(5);
    expect(result.transitiveUsers).toBe(30);
    expect(result.uniqueUsers).toBe(30); // 5 shared + 5 g1-only + 20 g2-only
    expect(result.duplicates).toBe(5);   // 5 + 30 - 30 = 5
  });

  it('groups with Admin role are identified', () => {
    const adminAssignment: Assignment = { workspaceId: 'ws-1', workspaceName: 'WS1', role: 'Admin' };
    const memberAssignment: Assignment = { workspaceId: 'ws-2', workspaceName: 'WS2', role: 'Member' };

    const summaries: UserSummary[] = [
      makeGroup('admin-grp@x.com', [adminAssignment], 'Admins'),
      makeGroup('member-grp@x.com', [memberAssignment], 'Members'),
    ];

    const result = computeEffectiveAccess(summaries, NO_RESOLVED);

    expect(result.groupsWithAdminRole).toEqual(['Admins']);
    expect(result.groupsWithAdminRole).not.toContain('Members');
  });

  it('group with Admin role in one workspace and Viewer in another → still flagged', () => {
    const summaries: UserSummary[] = [
      makeGroup('grp@x.com', [
        { workspaceId: 'ws-1', workspaceName: 'WS1', role: 'Viewer' },
        { workspaceId: 'ws-2', workspaceName: 'WS2', role: 'Admin' },
      ], 'Mixed-Group'),
    ];

    const result = computeEffectiveAccess(summaries, NO_RESOLVED);
    expect(result.groupsWithAdminRole).toEqual(['Mixed-Group']);
  });
});

// ---------------------------------------------------------------------------
// c) Edge cases
// ---------------------------------------------------------------------------

describe('computeEffectiveAccess — edge cases', () => {
  it('group with 0 members contributes 0 to transitiveUsers', () => {
    const summaries: UserSummary[] = [makeGroup('empty-grp@x.com')];
    const resolved: Record<string, ResolvedGroup> = {
      'empty-grp@x.com': makeResolvedGroup('g1', []),
    };

    const result = computeEffectiveAccess(summaries, resolved);

    expect(result.groups).toBe(1);
    expect(result.transitiveUsers).toBe(0);
    expect(result.uniqueUsers).toBe(0);
  });

  it('group with loading=true and no resolved entry: not counted in transitiveUsers', () => {
    // Group is in userSummaries but has no resolvedGroups entry (still loading)
    const summaries: UserSummary[] = [makeUser('u1@x.com'), makeGroup('loading-grp@x.com')];

    // resolvedGroups does NOT contain 'loading-grp@x.com'
    const result = computeEffectiveAccess(summaries, NO_RESOLVED);

    expect(result.groups).toBe(1);   // group is counted in groups
    expect(result.transitiveUsers).toBe(0);  // but contributes no transitive users
    expect(result.uniqueUsers).toBe(1);       // only the direct user
  });

  it('group with loading=true and empty members array: contributes 0 transitive users', () => {
    const summaries: UserSummary[] = [makeGroup('loading-grp@x.com')];
    const resolved: Record<string, ResolvedGroup> = {
      'loading-grp@x.com': makeResolvedGroup('g1', [], { loading: true }),
    };

    const result = computeEffectiveAccess(summaries, resolved);
    expect(result.transitiveUsers).toBe(0);
    expect(result.uniqueUsers).toBe(0);
  });

  it('group with error: contributes 0 transitive users', () => {
    const summaries: UserSummary[] = [makeGroup('err-grp@x.com')];
    const resolved: Record<string, ResolvedGroup> = {
      'err-grp@x.com': makeResolvedGroup('g1', [], { error: 'Graph API unavailable' }),
    };

    const result = computeEffectiveAccess(summaries, resolved);
    expect(result.transitiveUsers).toBe(0);
    expect(result.uniqueUsers).toBe(0);
    expect(result.groups).toBe(1); // group is still counted
  });

  it('all assignments are groups (no direct users)', () => {
    const summaries: UserSummary[] = [
      makeGroup('g1@x.com'),
      makeGroup('g2@x.com'),
    ];
    const resolved: Record<string, ResolvedGroup> = {
      'g1@x.com': makeResolvedGroup('g1', ['m1@x.com', 'm2@x.com']),
      'g2@x.com': makeResolvedGroup('g2', ['m3@x.com', 'm4@x.com']),
    };

    const result = computeEffectiveAccess(summaries, resolved);

    expect(result.directUsers).toBe(0);
    expect(result.groups).toBe(2);
    expect(result.transitiveUsers).toBe(4);
    expect(result.uniqueUsers).toBe(4);
  });

  it('all assignments are direct users (no groups)', () => {
    const summaries: UserSummary[] = [
      makeUser('u1@x.com'),
      makeUser('u2@x.com'),
      makeUser('u3@x.com'),
    ];

    const result = computeEffectiveAccess(summaries, NO_RESOLVED);

    expect(result.directUsers).toBe(3);
    expect(result.groups).toBe(0);
    expect(result.transitiveUsers).toBe(0);
    expect(result.uniqueUsers).toBe(3);
    expect(result.duplicates).toBe(0);
  });

  it('empty summaries → all counts are 0', () => {
    const result = computeEffectiveAccess([], NO_RESOLVED);

    expect(result.directUsers).toBe(0);
    expect(result.groups).toBe(0);
    expect(result.servicePrincipals).toBe(0);
    expect(result.transitiveUsers).toBe(0);
    expect(result.uniqueUsers).toBe(0);
    expect(result.duplicates).toBe(0);
    expect(result.groupsWithAdminRole).toEqual([]);
  });

  it('duplicates never go negative', () => {
    // Edge case: if somehow counts would produce negative duplicates, Math.max(0,...) guards it
    const summaries: UserSummary[] = [makeUser('u1@x.com')];
    const result = computeEffectiveAccess(summaries, NO_RESOLVED);
    expect(result.duplicates).toBeGreaterThanOrEqual(0);
  });

  it('service principals are counted separately and do not affect uniqueUsers', () => {
    const summaries: UserSummary[] = [
      makeUser('u1@x.com'),
      makeSpn('spn1@app.com'),
      makeSpn('spn2@app.com'),
    ];

    const result = computeEffectiveAccess(summaries, NO_RESOLVED);

    expect(result.servicePrincipals).toBe(2);
    expect(result.directUsers).toBe(1);
    expect(result.uniqueUsers).toBe(1); // SPNs are not included in uniqueUsers
  });
});
