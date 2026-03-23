import type { Workspace } from '@/api/types/workspace';
import type { HealthScore } from '@/utils/healthScore';
import { HEALTH_SCORE_WEIGHTS, CRITICAL_HEALTH_CHECKS } from '@/utils/constants';

export interface AggregatedIssue {
  checkId: string;
  label: string;
  fixLabel: string;
  severity: 'critical' | 'improvement';
  weight: number;
  affectedCount: number;
  recoverablePoints: number;
  affectedWorkspaceIds: string[];
}

/** Maps health check display names to their weight-key (checkId). */
const CHECK_NAME_TO_ID: Record<string, string> = {
  'Description provided': 'description',
  'Capacity assigned': 'capacity',
  'Domain assigned': 'domain',
  'Git integration': 'git',
  'Naming convention': 'naming',
  'Active items': 'activeItems',
  'Data layer present': 'dataLayer',
  'Reasonable item count': 'reasonableCount',
  'Workspace identity': 'identity',
  'Tag coverage': 'tagCoverage',
};

/** Human-readable label for each check type. */
const CHECK_LABELS: Record<string, string> = {
  description: 'No workspace description',
  capacity: 'No dedicated capacity assigned',
  domain: 'No domain assigned',
  git: 'Git integration not configured',
  naming: 'Naming convention violation',
  activeItems: 'Workspace has no active items',
  dataLayer: 'No data layer (Lakehouse or Warehouse)',
  reasonableCount: 'Excessive item count',
  identity: 'No workspace identity (SPN)',
  tagCoverage: 'Low tag coverage on items',
};

/** Actionable fix suggestion for each check type. */
const CHECK_FIX_LABELS: Record<string, string> = {
  description: 'Add a description to explain the workspace purpose',
  capacity: 'Assign a dedicated capacity to avoid shared resource contention',
  domain: 'Assign a domain for governance and discoverability',
  git: 'Configure Git integration for version control',
  naming: 'Rename workspaces to follow the naming convention',
  activeItems: 'Add content or archive empty workspaces',
  dataLayer: 'Add a Lakehouse or Warehouse as a data foundation',
  reasonableCount: 'Split large workspaces to stay within the recommended limit',
  identity: 'Configure workspace identity (service principal)',
  tagCoverage: 'Apply tags to at least 80% of items for discoverability',
};

const criticalSet = new Set<string>(CRITICAL_HEALTH_CHECKS);

export function aggregateGovernanceIssues(
  workspaces: Workspace[],
  healthResults: Map<string, HealthScore>,
): AggregatedIssue[] {
  // checkId → set of affected workspace IDs
  const affected = new Map<string, Set<string>>();

  for (const ws of workspaces) {
    const health = healthResults.get(ws.id);
    if (!health) continue;

    for (const check of health.checks) {
      if (check.passed) continue;
      const checkId = CHECK_NAME_TO_ID[check.name];
      if (!checkId) continue;

      if (!affected.has(checkId)) affected.set(checkId, new Set());
      affected.get(checkId)!.add(ws.id);
    }
  }

  const issues: AggregatedIssue[] = [];

  for (const [checkId, wsIds] of affected) {
    const weight = HEALTH_SCORE_WEIGHTS[checkId as keyof typeof HEALTH_SCORE_WEIGHTS] ?? 0;
    const affectedCount = wsIds.size;
    issues.push({
      checkId,
      label: CHECK_LABELS[checkId] ?? checkId,
      fixLabel: CHECK_FIX_LABELS[checkId] ?? checkId,
      severity: criticalSet.has(checkId) ? 'critical' : 'improvement',
      weight,
      affectedCount,
      recoverablePoints: weight * affectedCount,
      affectedWorkspaceIds: [...wsIds],
    });
  }

  // Sort by recoverablePoints descending within each severity tier (critical first)
  return issues.sort((a, b) => b.recoverablePoints - a.recoverablePoints);
}
