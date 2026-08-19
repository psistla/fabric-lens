import type { Workspace } from '@/api/types/workspace';
import type { Item } from '@/api/types/item';
import {
  DEFAULT_NAMING_PATTERN,
  HEALTH_SCORE_WEIGHTS,
  GRADE_THRESHOLDS,
  MAX_REASONABLE_ITEM_COUNT,
} from '@/utils/constants';

export interface HealthCheck {
  name: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  detail: string;
}

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface HealthScore {
  total: number;
  maxTotal: number;
  percentage: number;
  checks: HealthCheck[];
  grade: HealthGrade;
}

/** The one grade ladder. Health scores, the tenant roll-up, the report and the
 *  security posture all read it, so a threshold moves everywhere at once or
 *  nowhere. It was written out four times before. */
export function getGrade(percentage: number): HealthGrade {
  if (percentage >= GRADE_THRESHOLDS.A) return 'A';
  if (percentage >= GRADE_THRESHOLDS.B) return 'B';
  if (percentage >= GRADE_THRESHOLDS.C) return 'C';
  if (percentage >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

export function calculateWorkspaceHealth(
  workspace: Workspace,
  items: Item[],
  namingPattern: RegExp = DEFAULT_NAMING_PATTERN,
): HealthScore {
  const w = HEALTH_SCORE_WEIGHTS;
  const checks: HealthCheck[] = [];

  // Description provided
  const hasDescription = (workspace.description ?? '').trim().length > 0;
  checks.push({
    name: 'Description provided',
    passed: hasDescription,
    points: hasDescription ? w.description : 0,
    maxPoints: w.description,
    detail: hasDescription
      ? 'Workspace has a description'
      : 'Add a description to explain the workspace purpose',
  });

  // Capacity assigned
  const hasCapacity = !!workspace.capacityId;
  checks.push({
    name: 'Capacity assigned',
    passed: hasCapacity,
    points: hasCapacity ? w.capacity : 0,
    maxPoints: w.capacity,
    detail: hasCapacity
      ? `Assigned to capacity ${workspace.capacityId}`
      : 'No capacity assigned; workspace runs on shared capacity',
  });

  // Domain assigned
  const hasDomain = !!workspace.domainId;
  checks.push({
    name: 'Domain assigned',
    passed: hasDomain,
    points: hasDomain ? w.domain : 0,
    maxPoints: w.domain,
    detail: hasDomain
      ? `Assigned to domain ${workspace.domainId}`
      : 'Assign a domain for better governance and discoverability',
  });

  // Workspace identity — SPN configuration enables both Git integration and automation
  // The Fabric API returns workspaceIdentity as a unit: present with a non-empty
  // servicePrincipalId, or absent entirely. Merging these into one 25-pt check
  // (was separate git:15 + identity:10) reflects what the API actually exposes.
  const hasIdentity = !!workspace.workspaceIdentity?.servicePrincipalId;
  checks.push({
    name: 'Workspace identity',
    passed: hasIdentity,
    points: hasIdentity ? w.workspaceIdentity : 0,
    maxPoints: w.workspaceIdentity,
    detail: hasIdentity
      ? 'Service principal configured, enabling Git integration and automation'
      : 'No workspace identity; configure SPN to enable Git integration and automation',
  });

  // Naming convention
  const matchesNaming = namingPattern.test(workspace.displayName);
  checks.push({
    name: 'Naming convention',
    passed: matchesNaming,
    points: matchesNaming ? w.naming : 0,
    maxPoints: w.naming,
    detail: matchesNaming
      ? `"${workspace.displayName}" follows naming conventions`
      : `"${workspace.displayName}" does not match the expected naming pattern`,
  });

  // Active items
  const hasItems = items.length > 0;
  checks.push({
    name: 'Active items',
    passed: hasItems,
    points: hasItems ? w.activeItems : 0,
    maxPoints: w.activeItems,
    detail: hasItems
      ? `${items.length} item${items.length === 1 ? '' : 's'} in workspace`
      : 'Workspace has no items; consider adding content or archiving',
  });

  // Data layer present
  const hasDataLayer = items.some(
    (i) => i.type === 'Lakehouse' || i.type === 'Warehouse',
  );
  checks.push({
    name: 'Data layer present',
    passed: hasDataLayer,
    points: hasDataLayer ? w.dataLayer : 0,
    maxPoints: w.dataLayer,
    detail: hasDataLayer
      ? 'Workspace includes a Lakehouse or Warehouse'
      : 'No Lakehouse or Warehouse found; consider adding a data layer',
  });

  // Reasonable item count
  const reasonableCount = items.length <= MAX_REASONABLE_ITEM_COUNT;
  checks.push({
    name: 'Reasonable item count',
    passed: reasonableCount,
    points: reasonableCount ? w.reasonableCount : 0,
    maxPoints: w.reasonableCount,
    detail: reasonableCount
      ? `${items.length} items (within recommended limit of ${MAX_REASONABLE_ITEM_COUNT})`
      : `${items.length} items exceeds recommended limit of ${MAX_REASONABLE_ITEM_COUNT}; consider splitting`,
  });


  // Tag coverage — skip when workspace has no items (neutral, not penalizing)
  if (items.length > 0) {
    const taggedCount = items.filter((i) => i.tags && i.tags.length > 0).length;
    const tagPct = taggedCount / items.length;
    let tagPoints: number;
    if (tagPct >= 0.8) {
      tagPoints = w.tagCoverage;
    } else if (tagPct >= 0.5) {
      tagPoints = Math.round(w.tagCoverage / 2);
    } else {
      tagPoints = 0;
    }
    const tagPassed = tagPct >= 0.8;
    const tagPctDisplay = Math.round(tagPct * 100);
    checks.push({
      name: 'Tag coverage',
      passed: tagPassed,
      points: tagPoints,
      maxPoints: w.tagCoverage,
      detail: tagPassed
        ? `${taggedCount} of ${items.length} items tagged (${tagPctDisplay}%)`
        : `Only ${taggedCount} of ${items.length} items tagged (${tagPctDisplay}%); apply tags to improve item discoverability and governance`,
    });
  }

  const total = checks.reduce((sum, c) => sum + c.points, 0);
  const maxTotal = checks.reduce((sum, c) => sum + c.maxPoints, 0);
  const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

  return {
    total,
    maxTotal,
    percentage,
    checks,
    grade: getGrade(percentage),
  };
}
