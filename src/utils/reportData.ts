import type { HealthGrade, HealthScore } from '@/utils/healthScore';
import type { SecurityPosture } from '@/utils/securityFindings';
import type { RiskyTenantSetting } from '@/api/types/tenantSettings';
import type { WidelySharedArtifact } from '@/api/types/widelyShared';
import type { GhostWorkspace } from '@/utils/ghostWorkspaces';
import type { UserSummary } from '@/utils/effectiveAccess';
import type { Workspace } from '@/api/types/workspace';
import { HEALTH_SCORE_WEIGHTS, ADMIN_ROLE_WARNING_THRESHOLD } from '@/utils/constants';

export interface WorkspaceHealthSummary {
  workspaceId: string;
  workspaceName: string;
  percentage: number;
  grade: HealthGrade;
}

export interface Recommendation {
  action: string;
  recoverablePoints: number;
  affectedCount: number;
  priority: 'critical' | 'high' | 'medium';
}

export interface ReportData {
  generatedAt: Date;
  overallGrade: HealthGrade;
  overallScore: number;
  workspaceCount: number;
  gradeDistribution: Partial<Record<HealthGrade, number>>;
  worstWorkspaces: WorkspaceHealthSummary[];
  securityPosture: SecurityPosture | null;
  overassignedWorkspaceCount: number;
  riskySettings: RiskyTenantSetting[];
  settingsLoaded: boolean;
  widelySharedArtifacts: WidelySharedArtifact[];
  artifactsLoaded: boolean;
  ghostWorkspaces: GhostWorkspace[];
  activityLoaded: boolean;
  topRecommendations: Recommendation[];
}

export const CHECK_ACTION_MAP: Record<keyof typeof HEALTH_SCORE_WEIGHTS, string> = {
  description:       'Add descriptions to workspaces',
  capacity:          'Assign workspaces to a capacity',
  domain:            'Assign workspaces to a domain',
  workspaceIdentity: 'Enable workspace identity (SPN + Git)',
  naming:            'Enforce naming convention',
  activeItems:       'Add items to empty workspaces',
  dataLayer:         'Add a data layer (Lakehouse or Warehouse)',
  reasonableCount:   'Reduce oversized workspaces (>100 items)',
  tagCoverage:       'Improve tag coverage to ≥80%',
};

// Maps HealthCheck.name → HEALTH_SCORE_WEIGHTS key for recommendation derivation
const CHECK_NAME_TO_KEY: Record<string, keyof typeof HEALTH_SCORE_WEIGHTS> = {
  'Description provided':  'description',
  'Capacity assigned':     'capacity',
  'Domain assigned':       'domain',
  'Workspace identity':    'workspaceIdentity',
  'Naming convention':     'naming',
  'Active items':          'activeItems',
  'Data layer present':    'dataLayer',
  'Reasonable item count': 'reasonableCount',
  'Tag coverage':          'tagCoverage',
};

interface AssembleParams {
  generatedAt: Date;
  tenantScore: number;
  tenantGrade: HealthGrade;
  healthMap: Map<string, HealthScore>;
  workspaces: Workspace[];
  userSummaries: UserSummary[];
  securityPosture: SecurityPosture | null;
  riskySettings: RiskyTenantSetting[];
  settingsLoaded: boolean;
  widelySharedArtifacts: WidelySharedArtifact[];
  artifactsLoaded: boolean;
  ghostWorkspaces: GhostWorkspace[];
  activityLoaded: boolean;
}

export function assembleReportData(params: AssembleParams): ReportData {
  const {
    generatedAt, tenantScore, tenantGrade, healthMap, workspaces,
    userSummaries, securityPosture, riskySettings, settingsLoaded,
    widelySharedArtifacts, artifactsLoaded, ghostWorkspaces, activityLoaded,
  } = params;

  // Grade distribution
  const gradeDistribution: Partial<Record<HealthGrade, number>> = {};
  for (const h of healthMap.values()) {
    gradeDistribution[h.grade] = (gradeDistribution[h.grade] ?? 0) + 1;
  }

  // Worst workspaces: bottom 5 by percentage ascending
  const worstWorkspaces: WorkspaceHealthSummary[] = workspaces
    .map((ws) => ({
      workspaceId: ws.id,
      workspaceName: ws.displayName,
      percentage: healthMap.get(ws.id)?.percentage ?? 0,
      grade: healthMap.get(ws.id)?.grade ?? ('F' as HealthGrade),
    }))
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 5);

  // Overassigned workspace count: workspaces with admin count > ADMIN_ROLE_WARNING_THRESHOLD
  const adminCountByWorkspace = new Map<string, number>();
  for (const u of userSummaries) {
    for (const a of u.assignments) {
      if (a.role === 'Admin') {
        adminCountByWorkspace.set(
          a.workspaceId,
          (adminCountByWorkspace.get(a.workspaceId) ?? 0) + 1,
        );
      }
    }
  }
  const overassignedWorkspaceCount = [...adminCountByWorkspace.values()].filter(
    (count) => count > ADMIN_ROLE_WARNING_THRESHOLD,
  ).length;

  // Aggregate check failures across workspaces for recommendations
  const checkFailCounts: Partial<Record<keyof typeof HEALTH_SCORE_WEIGHTS, number>> = {};
  for (const h of healthMap.values()) {
    for (const check of h.checks) {
      if (!check.passed) {
        const key = CHECK_NAME_TO_KEY[check.name];
        if (key !== undefined) {
          checkFailCounts[key] = (checkFailCounts[key] ?? 0) + 1;
        }
      }
    }
  }

  const topRecommendations: Recommendation[] = (
    Object.keys(HEALTH_SCORE_WEIGHTS) as Array<keyof typeof HEALTH_SCORE_WEIGHTS>
  )
    .filter((key) => (checkFailCounts[key] ?? 0) > 0)
    .map((key) => {
      const affectedCount = checkFailCounts[key]!;
      const recoverablePoints = affectedCount * HEALTH_SCORE_WEIGHTS[key];
      const priority: Recommendation['priority'] =
        recoverablePoints > 100 ? 'critical' : recoverablePoints > 50 ? 'high' : 'medium';
      return { action: CHECK_ACTION_MAP[key], recoverablePoints, affectedCount, priority };
    })
    .sort((a, b) => b.recoverablePoints - a.recoverablePoints)
    .slice(0, 5);

  return {
    generatedAt,
    overallGrade: tenantGrade,
    overallScore: tenantScore,
    workspaceCount: workspaces.length,
    gradeDistribution,
    worstWorkspaces,
    securityPosture,
    overassignedWorkspaceCount,
    riskySettings,
    settingsLoaded,
    widelySharedArtifacts,
    artifactsLoaded,
    ghostWorkspaces,
    activityLoaded,
    topRecommendations,
  };
}
