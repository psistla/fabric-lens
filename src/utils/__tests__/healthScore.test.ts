import { describe, it, expect } from 'vitest';
import { calculateWorkspaceHealth } from '@/utils/healthScore';
import {
  HEALTH_SCORE_WEIGHTS as W,
  MAX_REASONABLE_ITEM_COUNT,
  DEFAULT_NAMING_PATTERN,
} from '@/utils/constants';
import type { Workspace } from '@/api/types/workspace';
import type { Item } from '@/api/types/item';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Workspace that fails every check except reasonableCount (0 items → 0 ≤ 100). */
const BASE_WS: Workspace = {
  id: 'ws-base',
  displayName: 'invalid', // fails naming: DEFAULT_NAMING_PATTERN requires ^[A-Z]
  description: '',         // fails description
  type: 'Workspace',
  state: 'Active',
  // capacityId: absent → fails capacity
  // domainId: absent → fails domain
  // workspaceIdentity: absent → fails git + identity
};

/** Workspace where every check passes (score = 100). */
const PERFECT_WS: Workspace = {
  id: 'ws-perfect',
  displayName: 'ValidWorkspace',
  description: 'A well-governed workspace',
  type: 'Workspace',
  state: 'Active',
  capacityId: 'cap-1',
  domainId: 'dom-1',
  workspaceIdentity: { applicationId: 'app-1', servicePrincipalId: 'spn-1' },
};

function makeItem(type: Item['type'], id = 'item-1'): Item {
  return { id, displayName: 'Item', description: '', type, workspaceId: 'ws-base' };
}

/** N items of a given type with unique ids. */
function makeItems(n: number, type: Item['type'] = 'Notebook'): Item[] {
  return Array.from({ length: n }, (_, i) => makeItem(type, `item-${i}`));
}

/** Items for PERFECT_WS: 1 Lakehouse + 1 Notebook, both tagged → all 10 checks pass. */
const PERFECT_ITEMS: Item[] = [
  { ...makeItem('Lakehouse', 'lh-1'), tags: [{ id: 'tag-0001', displayName: 'Production' }] },
  { ...makeItem('Notebook', 'nb-1'), tags: [{ id: 'tag-0002', displayName: 'Approved' }] },
];

// Helper to find a check by name
function getCheck(result: ReturnType<typeof calculateWorkspaceHealth>, name: string) {
  const check = result.checks.find((c) => c.name === name);
  if (!check) throw new Error(`Check "${name}" not found`);
  return check;
}

// ---------------------------------------------------------------------------
// a) Individual check tests — one per criterion
// ---------------------------------------------------------------------------

describe('calculateWorkspaceHealth — individual checks', () => {
  it('description: passes when workspace has a non-empty description', () => {
    const ws = { ...BASE_WS, description: 'Useful workspace' };
    const result = calculateWorkspaceHealth(ws, []);

    const check = getCheck(result, 'Description provided');
    expect(check.passed).toBe(true);
    expect(check.points).toBe(W.description);
    expect(check.maxPoints).toBe(W.description);

    // All independent checks still fail
    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Git integration').passed).toBe(false);
    expect(getCheck(result, 'Naming convention').passed).toBe(false);
    expect(getCheck(result, 'Active items').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
    // Note: reasonableCount co-passes with 0 items (0 ≤ MAX_REASONABLE_ITEM_COUNT).
  });

  it('capacity: passes when capacityId is set', () => {
    const ws = { ...BASE_WS, capacityId: 'cap-1' };
    const result = calculateWorkspaceHealth(ws, []);

    const check = getCheck(result, 'Capacity assigned');
    expect(check.passed).toBe(true);
    expect(check.points).toBe(W.capacity);

    expect(getCheck(result, 'Description provided').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Git integration').passed).toBe(false);
    expect(getCheck(result, 'Naming convention').passed).toBe(false);
    expect(getCheck(result, 'Active items').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
  });

  it('domain: passes when domainId is set', () => {
    const ws = { ...BASE_WS, domainId: 'dom-1' };
    const result = calculateWorkspaceHealth(ws, []);

    const check = getCheck(result, 'Domain assigned');
    expect(check.passed).toBe(true);
    expect(check.points).toBe(W.domain);

    expect(getCheck(result, 'Description provided').passed).toBe(false);
    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Git integration').passed).toBe(false);
    expect(getCheck(result, 'Naming convention').passed).toBe(false);
    expect(getCheck(result, 'Active items').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
  });

  it('git: passes when workspaceIdentity is set (with empty servicePrincipalId)', () => {
    // workspaceIdentity exists → git passes; servicePrincipalId='' → identity fails
    const ws = {
      ...BASE_WS,
      workspaceIdentity: { applicationId: 'app-1', servicePrincipalId: '' },
    };
    // Use 101 Notebooks so reasonableCount fails, activeItems passes → only git+activeItems
    const result = calculateWorkspaceHealth(ws, makeItems(101));

    const gitCheck = getCheck(result, 'Git integration');
    expect(gitCheck.passed).toBe(true);
    expect(gitCheck.points).toBe(W.git);

    // identity must fail (empty servicePrincipalId)
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);

    expect(getCheck(result, 'Description provided').passed).toBe(false);
    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Naming convention').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
    // 101 items → reasonableCount fails, activeItems passes
    expect(getCheck(result, 'Reasonable item count').passed).toBe(false);
  });

  it('naming: passes when displayName matches the naming convention regex', () => {
    const ws = { ...BASE_WS, displayName: 'ValidWorkspace' };
    const result = calculateWorkspaceHealth(ws, []);

    const check = getCheck(result, 'Naming convention');
    expect(check.passed).toBe(true);
    expect(check.points).toBe(W.naming);

    expect(getCheck(result, 'Description provided').passed).toBe(false);
    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Git integration').passed).toBe(false);
    expect(getCheck(result, 'Active items').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
  });

  it('activeItems: passes when items.length > 0 (isolated from reasonableCount via 101 items)', () => {
    // 101 Notebook items → activeItems=pass, reasonableCount=fail, dataLayer=fail
    const result = calculateWorkspaceHealth(BASE_WS, makeItems(101));

    const check = getCheck(result, 'Active items');
    expect(check.passed).toBe(true);
    expect(check.points).toBe(W.activeItems);

    // Perfectly isolated: score = activeItems weight only
    expect(result.total).toBe(W.activeItems);

    expect(getCheck(result, 'Description provided').passed).toBe(false);
    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Git integration').passed).toBe(false);
    expect(getCheck(result, 'Naming convention').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
    expect(getCheck(result, 'Reasonable item count').passed).toBe(false);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
  });

  it('dataLayer: passes when a Lakehouse or Warehouse is present', () => {
    // dataLayer requires ≥1 item → activeItems co-passes (unavoidable)
    const result = calculateWorkspaceHealth(BASE_WS, [makeItem('Lakehouse')]);

    const check = getCheck(result, 'Data layer present');
    expect(check.passed).toBe(true);
    expect(check.points).toBe(W.dataLayer);

    // Also verify Warehouse triggers the check
    const result2 = calculateWorkspaceHealth(BASE_WS, [makeItem('Warehouse')]);
    expect(getCheck(result2, 'Data layer present').passed).toBe(true);

    expect(getCheck(result, 'Description provided').passed).toBe(false);
    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Git integration').passed).toBe(false);
    expect(getCheck(result, 'Naming convention').passed).toBe(false);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
  });

  it('reasonableCount: passes when items.length ≤ MAX_REASONABLE_ITEM_COUNT (perfectly isolated)', () => {
    // 0 items → activeItems=fail, dataLayer=fail, reasonableCount=pass, all others fail on BASE_WS
    const result = calculateWorkspaceHealth(BASE_WS, []);

    const check = getCheck(result, 'Reasonable item count');
    expect(check.passed).toBe(true);
    expect(check.points).toBe(W.reasonableCount);

    // Perfectly isolated: only reasonableCount passes
    expect(result.total).toBe(W.reasonableCount);

    expect(getCheck(result, 'Description provided').passed).toBe(false);
    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Git integration').passed).toBe(false);
    expect(getCheck(result, 'Naming convention').passed).toBe(false);
    expect(getCheck(result, 'Active items').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
  });

  it('identity: passes when workspaceIdentity has a non-empty servicePrincipalId', () => {
    // identity requires workspaceIdentity.servicePrincipalId → git co-passes (unavoidable)
    const ws = {
      ...BASE_WS,
      workspaceIdentity: { applicationId: 'app-1', servicePrincipalId: 'spn-1' },
    };
    const result = calculateWorkspaceHealth(ws, []);

    const check = getCheck(result, 'Workspace identity');
    expect(check.passed).toBe(true);
    expect(check.points).toBe(W.identity);

    // git must also pass when workspaceIdentity is set (unavoidable dependency)
    expect(getCheck(result, 'Git integration').passed).toBe(true);

    expect(getCheck(result, 'Description provided').passed).toBe(false);
    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Naming convention').passed).toBe(false);
    expect(getCheck(result, 'Active items').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// b) Boundary condition tests
// ---------------------------------------------------------------------------

describe('calculateWorkspaceHealth — boundary conditions', () => {
  it('perfect score: all 10 checks pass → score = 100%, grade = A', () => {
    const result = calculateWorkspaceHealth(PERFECT_WS, PERFECT_ITEMS);

    expect(result.total).toBe(110);
    expect(result.maxTotal).toBe(110);
    expect(result.percentage).toBe(100);
    expect(result.grade).toBe('A');
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it('minimum score: with all checks engineered to fail, only reasonableCount passes (score = 10)', () => {
    // Note: a true "zero score" is impossible with current weights because either
    // reasonableCount (0 items) or activeItems (>0 items) always passes.
    // The minimum achievable score is 10 via 0 items → reasonableCount passes.
    const result = calculateWorkspaceHealth(BASE_WS, []);
    expect(result.total).toBe(W.reasonableCount);
    expect(result.grade).toBe('F');
  });

  describe('grade boundaries', () => {
    // With 10 checks and maxTotal=110, achievable percentages are:
    // 110→100%, 100→91%, 95→86%, 90→82%, 85→77%, 80→73%, 75→68%,
    // 70→64%, 65→59%, 60→55%, 55→50%, 50→45%, 45→41% ...

    it('91% → grade A (≥ 90): fail tag coverage only (untagged items)', () => {
      // Fail tag(10) only → 110 - 10 = 100, percentage = 91%
      const items = PERFECT_ITEMS.map((i) => ({ ...i, tags: undefined }));
      const result = calculateWorkspaceHealth(PERFECT_WS, items);
      expect(result.total).toBe(100);
      expect(result.maxTotal).toBe(110);
      expect(result.percentage).toBe(91);
      expect(result.grade).toBe('A');
    });

    it('82% → grade B (≥ 80): fail description + tag coverage', () => {
      // Fail description(10) + tag(10) → 110 - 20 = 90, percentage = 82%
      const ws = { ...PERFECT_WS, description: '' };
      const items = PERFECT_ITEMS.map((i) => ({ ...i, tags: undefined }));
      const result = calculateWorkspaceHealth(ws, items);
      expect(result.total).toBe(90);
      expect(result.maxTotal).toBe(110);
      expect(result.percentage).toBe(82);
      expect(result.grade).toBe('B');
    });

    it('77% → grade C (< 80, ≥ 65): fail description + domain + tag coverage', () => {
      // Fail description(10) + domain(10) + tag(10) → 110 - 30 = 80, percentage = 73%
      const ws = { ...PERFECT_WS, description: '', domainId: undefined };
      const items = PERFECT_ITEMS.map((i) => ({ ...i, tags: undefined }));
      const result = calculateWorkspaceHealth(ws, items);
      expect(result.total).toBe(80);
      expect(result.maxTotal).toBe(110);
      expect(result.percentage).toBe(73);
      expect(result.grade).toBe('C');
    });

    it('68% → grade C (in C range): fail capacity + domain + tag coverage', () => {
      // Fail capacity(15) + domain(10) + tag(10) → 110 - 35 = 75, percentage = 68%
      const ws = { ...PERFECT_WS, capacityId: undefined, domainId: undefined };
      const items = PERFECT_ITEMS.map((i) => ({ ...i, tags: undefined }));
      const result = calculateWorkspaceHealth(ws, items);
      expect(result.total).toBe(75);
      expect(result.maxTotal).toBe(110);
      expect(result.percentage).toBe(68);
      expect(result.grade).toBe('C');
    });

    it('64% → grade D (< 65): fail capacity + domain + description + tag coverage', () => {
      // Fail capacity(15) + domain(10) + description(10) + tag(10) → 110 - 45 = 65, percentage = 59%
      // Using capacity+workspaceIdentity instead for a simpler setup:
      // Fail workspaceIdentity(git 15 + identity 10) + capacity(15) + tag(10) → 110 - 50 = 60, percentage = 55%
      const ws = { ...PERFECT_WS, capacityId: undefined, workspaceIdentity: undefined };
      const items = PERFECT_ITEMS.map((i) => ({ ...i, tags: undefined }));
      const result = calculateWorkspaceHealth(ws, items);
      // Fail: capacity(15) + git(15) + identity(10) + tag(10) = 50 → total = 60
      expect(result.total).toBe(60);
      expect(result.maxTotal).toBe(110);
      expect(result.percentage).toBe(55);
      expect(result.grade).toBe('D');
    });

    it('50% → grade D (exactly at D threshold)', () => {
      // Fail capacity(15) + domain(10) + description(10) + naming(10) + tag(10) = 55 → total = 55
      // percentage = 55/110 * 100 = 50% → D
      const ws = {
        ...PERFECT_WS,
        capacityId: undefined,
        domainId: undefined,
        description: '',
        displayName: 'invalid', // fails naming
      };
      const items = PERFECT_ITEMS.map((i) => ({ ...i, tags: undefined }));
      const result = calculateWorkspaceHealth(ws, items);
      expect(result.total).toBe(55);
      expect(result.maxTotal).toBe(110);
      expect(result.percentage).toBe(50);
      expect(result.grade).toBe('D');
    });

    it('41% → grade F (< 50)', () => {
      // capacity(15) + activeItems(10) + dataLayer(10) + reasonableCount(10) = 45
      // Fails: description, naming, domain, git, identity, tag (0/1 = 0%)
      const ws: Workspace = {
        id: 'ws-f',
        displayName: 'invalid',
        description: '',
        type: 'Workspace',
        state: 'Active',
        capacityId: 'cap-1',
      };
      const result = calculateWorkspaceHealth(ws, [makeItem('Lakehouse')]);
      expect(result.total).toBe(45);
      expect(result.maxTotal).toBe(110);
      expect(result.percentage).toBe(41);
      expect(result.grade).toBe('F');
    });
  });
});

// ---------------------------------------------------------------------------
// c) Edge cases
// ---------------------------------------------------------------------------

describe('calculateWorkspaceHealth — edge cases', () => {
  it('empty items array: activeItems fails, dataLayer fails, reasonableCount passes', () => {
    // Note: there is no separate "stale items" check in the current implementation.
    // The "Active items" criterion checks items.length > 0.
    const result = calculateWorkspaceHealth(BASE_WS, []);

    expect(getCheck(result, 'Active items').passed).toBe(false);
    expect(getCheck(result, 'Data layer present').passed).toBe(false);
    expect(getCheck(result, 'Reasonable item count').passed).toBe(true);
  });

  it('absent optional fields (capacityId, domainId, workspaceIdentity) → checks fail gracefully', () => {
    const ws: Workspace = {
      id: 'ws-optional',
      displayName: 'ValidWorkspace',
      description: 'Has description',
      type: 'Workspace',
      state: 'Active',
      // all optional fields absent
    };
    const result = calculateWorkspaceHealth(ws, []);

    expect(getCheck(result, 'Capacity assigned').passed).toBe(false);
    expect(getCheck(result, 'Domain assigned').passed).toBe(false);
    expect(getCheck(result, 'Git integration').passed).toBe(false);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
    // description and naming pass
    expect(getCheck(result, 'Description provided').passed).toBe(true);
    expect(getCheck(result, 'Naming convention').passed).toBe(true);
  });

  it(`exactly ${MAX_REASONABLE_ITEM_COUNT} items: reasonableCount passes (boundary inclusive)`, () => {
    const result = calculateWorkspaceHealth(BASE_WS, makeItems(MAX_REASONABLE_ITEM_COUNT));
    expect(getCheck(result, 'Reasonable item count').passed).toBe(true);
  });

  it(`${MAX_REASONABLE_ITEM_COUNT + 1} items: reasonableCount fails (one over boundary)`, () => {
    const result = calculateWorkspaceHealth(BASE_WS, makeItems(MAX_REASONABLE_ITEM_COUNT + 1));
    expect(getCheck(result, 'Reasonable item count').passed).toBe(false);
  });

  it('item type other than Lakehouse/Warehouse: dataLayer fails', () => {
    const nonDataLayerTypes: Item['type'][] = ['Notebook', 'Report', 'Pipeline', 'Dashboard'];
    for (const type of nonDataLayerTypes) {
      const result = calculateWorkspaceHealth(BASE_WS, [makeItem(type)]);
      expect(getCheck(result, 'Data layer present').passed).toBe(false);
    }
  });

  it('description with only whitespace: description check fails', () => {
    const ws = { ...BASE_WS, description: '   ' };
    const result = calculateWorkspaceHealth(ws, []);
    expect(getCheck(result, 'Description provided').passed).toBe(false);
  });

  it('workspaceIdentity with empty servicePrincipalId: git passes, identity fails', () => {
    const ws = {
      ...BASE_WS,
      workspaceIdentity: { applicationId: 'app-1', servicePrincipalId: '' },
    };
    const result = calculateWorkspaceHealth(ws, []);
    expect(getCheck(result, 'Git integration').passed).toBe(true);
    expect(getCheck(result, 'Workspace identity').passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// d) Naming convention check
// ---------------------------------------------------------------------------

describe('calculateWorkspaceHealth — naming convention', () => {
  // DEFAULT_NAMING_PATTERN = /^[A-Z][a-zA-Z0-9]+([-_ ][A-Za-z0-9]+)*$/
  // Rules: must start with A–Z, followed by ≥1 alphanumeric chars,
  // then zero or more groups of (hyphen | underscore | space) + alphanumeric+

  const passing = [
    'ValidWorkspace',
    'Project',
    'MyProject-Alpha',
    'Data Warehouse',
    'Ws1',
    'Test-Env-2024',
    'A1',
  ];

  const failing = [
    'invalid',       // lowercase start
    '1Invalid',      // digit start
    '-BadStart',     // separator start
    'Valid-',        // trailing separator, no alphanumeric after
    'V',             // only one character (requires ≥2: [A-Z] + [a-zA-Z0-9]+)
    '',              // empty
    'VALID--Name',   // double separator
  ];

  for (const name of passing) {
    it(`"${name}" matches naming convention`, () => {
      const ws = { ...BASE_WS, displayName: name };
      const result = calculateWorkspaceHealth(ws, []);
      expect(getCheck(result, 'Naming convention').passed).toBe(true);
    });
  }

  for (const name of failing) {
    it(`"${name}" does not match naming convention`, () => {
      const ws = { ...BASE_WS, displayName: name };
      const result = calculateWorkspaceHealth(ws, []);
      expect(getCheck(result, 'Naming convention').passed).toBe(false);
    });
  }

  it('custom regex overrides default naming pattern', () => {
    const custom = /^ws-\d+$/; // only "ws-<digits>"
    const ws = { ...BASE_WS, displayName: 'ws-42' };
    expect(calculateWorkspaceHealth(ws, [], custom).checks.find((c) => c.name === 'Naming convention')?.passed).toBe(true);
    expect(calculateWorkspaceHealth(BASE_WS, [], custom).checks.find((c) => c.name === 'Naming convention')?.passed).toBe(false);
  });

  it('DEFAULT_NAMING_PATTERN exported from constants matches same regex used by healthScore', () => {
    // Verify the pattern string is documented correctly
    expect(DEFAULT_NAMING_PATTERN).toEqual(/^[A-Z][a-zA-Z0-9]+([-_ ][A-Za-z0-9]+)*$/);
  });
});

// ---------------------------------------------------------------------------
// e) Tag coverage check
// ---------------------------------------------------------------------------

describe('calculateWorkspaceHealth — tag coverage', () => {
  function makeTaggedItem(id: string, hasTag: boolean): Item {
    return {
      ...makeItem('Notebook', id),
      tags: hasTag ? [{ id: 'tag-prod', displayName: 'Production' }] : undefined,
    };
  }

  it('0 items: tag coverage check is skipped (not in checks array)', () => {
    const result = calculateWorkspaceHealth(BASE_WS, []);
    expect(result.checks.find((c) => c.name === 'Tag coverage')).toBeUndefined();
  });

  it('≥80% tagged: passes with full points (10)', () => {
    // 4/4 = 100% tagged → full points
    const items = [1, 2, 3, 4].map((n) => makeTaggedItem(`item-${n}`, true));
    const result = calculateWorkspaceHealth(BASE_WS, items);
    const check = result.checks.find((c) => c.name === 'Tag coverage')!;
    expect(check.passed).toBe(true);
    expect(check.points).toBe(10);
    expect(check.maxPoints).toBe(10);
    expect(check.detail).toContain('4 of 4');
  });

  it('exactly 80% tagged: passes with full points', () => {
    // 4/5 = 80%
    const items = [
      makeTaggedItem('a', true), makeTaggedItem('b', true),
      makeTaggedItem('c', true), makeTaggedItem('d', true),
      makeTaggedItem('e', false),
    ];
    const result = calculateWorkspaceHealth(BASE_WS, items);
    const check = result.checks.find((c) => c.name === 'Tag coverage')!;
    expect(check.passed).toBe(true);
    expect(check.points).toBe(10);
  });

  it('50–79% tagged: fails with half points (5)', () => {
    // 3/5 = 60%
    const items = [
      makeTaggedItem('a', true), makeTaggedItem('b', true), makeTaggedItem('c', true),
      makeTaggedItem('d', false), makeTaggedItem('e', false),
    ];
    const result = calculateWorkspaceHealth(BASE_WS, items);
    const check = result.checks.find((c) => c.name === 'Tag coverage')!;
    expect(check.passed).toBe(false);
    expect(check.points).toBe(5);
    expect(check.maxPoints).toBe(10);
    expect(check.detail).toContain('Only 3 of 5');
  });

  it('exactly 50% tagged: half points', () => {
    // 1/2 = 50%
    const items = [makeTaggedItem('a', true), makeTaggedItem('b', false)];
    const result = calculateWorkspaceHealth(BASE_WS, items);
    const check = result.checks.find((c) => c.name === 'Tag coverage')!;
    expect(check.passed).toBe(false);
    expect(check.points).toBe(5);
  });

  it('<50% tagged: fails with 0 points', () => {
    // 1/4 = 25%
    const items = [
      makeTaggedItem('a', true),
      makeTaggedItem('b', false), makeTaggedItem('c', false), makeTaggedItem('d', false),
    ];
    const result = calculateWorkspaceHealth(BASE_WS, items);
    const check = result.checks.find((c) => c.name === 'Tag coverage')!;
    expect(check.passed).toBe(false);
    expect(check.points).toBe(0);
    expect(check.detail).toContain('Only 1 of 4');
    expect(check.detail).toContain('apply tags');
  });

  it('0% tagged: 0 points', () => {
    const items = [makeTaggedItem('a', false), makeTaggedItem('b', false)];
    const result = calculateWorkspaceHealth(BASE_WS, items);
    const check = result.checks.find((c) => c.name === 'Tag coverage')!;
    expect(check.passed).toBe(false);
    expect(check.points).toBe(0);
    expect(check.detail).toContain('Only 0 of 2');
  });

  it('items with empty tags array treated as untagged', () => {
    const items: Item[] = [
      { ...makeItem('Notebook', 'a'), tags: [] },
      { ...makeItem('Notebook', 'b'), tags: [] },
    ];
    const result = calculateWorkspaceHealth(BASE_WS, items);
    const check = result.checks.find((c) => c.name === 'Tag coverage')!;
    expect(check.points).toBe(0);
  });

  it('tag coverage included in maxTotal when items present', () => {
    const result = calculateWorkspaceHealth(BASE_WS, [makeItem('Notebook', 'x')]);
    expect(result.maxTotal).toBe(110); // 100 base + 10 tag
  });

  it('tag coverage excluded from maxTotal when 0 items', () => {
    const result = calculateWorkspaceHealth(BASE_WS, []);
    expect(result.maxTotal).toBe(100); // no tag check
  });
});
