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

/** Items for PERFECT_WS: 1 Lakehouse + 1 Notebook = 2 items, all checks pass. */
const PERFECT_ITEMS: Item[] = [
  makeItem('Lakehouse', 'lh-1'),
  makeItem('Notebook', 'nb-1'),
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
  it('perfect score: all 9 checks pass → score = 100, grade = A', () => {
    const result = calculateWorkspaceHealth(PERFECT_WS, PERFECT_ITEMS);

    expect(result.total).toBe(100);
    expect(result.maxTotal).toBe(100);
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
    it('score 90 → grade A (≥ 90)', () => {
      // Fail description (10pts) only → 100 - 10 = 90
      const ws = { ...PERFECT_WS, description: '' };
      const result = calculateWorkspaceHealth(ws, PERFECT_ITEMS);
      expect(result.total).toBe(90);
      expect(result.grade).toBe('A');
    });

    it('score 80 → grade B (≥ 80)', () => {
      // Fail description(10) + domain(10) → 100 - 20 = 80
      const ws = { ...PERFECT_WS, description: '', domainId: undefined };
      const result = calculateWorkspaceHealth(ws, PERFECT_ITEMS);
      expect(result.total).toBe(80);
      expect(result.grade).toBe('B');
    });

    it('score 75 → grade C (< 80, ≥ 65)', () => {
      // Fail capacity(15) + domain(10) → 100 - 25 = 75
      const ws = { ...PERFECT_WS, capacityId: undefined, domainId: undefined };
      const result = calculateWorkspaceHealth(ws, PERFECT_ITEMS);
      expect(result.total).toBe(75);
      expect(result.grade).toBe('C');
    });

    it('score 65 → grade C (exactly at C threshold)', () => {
      // Fail capacity(15) + domain(10) + description(10) → 100 - 35 = 65
      const ws = { ...PERFECT_WS, capacityId: undefined, domainId: undefined, description: '' };
      const result = calculateWorkspaceHealth(ws, PERFECT_ITEMS);
      expect(result.total).toBe(65);
      expect(result.grade).toBe('C');
    });

    it('score 60 → grade D (< 65, ≥ 50)', () => {
      // Fail workspaceIdentity (git 15 + identity 10 = 25) + capacity(15) → 100 - 40 = 60
      const ws = { ...PERFECT_WS, capacityId: undefined, workspaceIdentity: undefined };
      const result = calculateWorkspaceHealth(ws, PERFECT_ITEMS);
      expect(result.total).toBe(60);
      expect(result.grade).toBe('D');
    });

    it('score 50 → grade D (exactly at D threshold)', () => {
      // Fail workspaceIdentity(25) + capacity(15) + description(10) → 100 - 50 = 50
      const ws = {
        ...PERFECT_WS,
        workspaceIdentity: undefined,
        capacityId: undefined,
        description: '',
      };
      const result = calculateWorkspaceHealth(ws, PERFECT_ITEMS);
      expect(result.total).toBe(50);
      expect(result.grade).toBe('D');
    });

    it('score 45 → grade F (< 50)', () => {
      // capacity(15) + activeItems(10) + dataLayer(10) + reasonableCount(10) = 45
      // Fail: description, domain, naming, workspaceIdentity (git+identity)
      const ws: Workspace = {
        id: 'ws-45',
        displayName: 'invalid',
        description: '',
        type: 'Workspace',
        state: 'Active',
        capacityId: 'cap-1', // passes capacity (15)
        // no domainId, no workspaceIdentity, naming fails
      };
      const result = calculateWorkspaceHealth(ws, [makeItem('Lakehouse')]);
      expect(result.total).toBe(45);
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
