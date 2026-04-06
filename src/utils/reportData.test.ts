import { describe, it, expect } from 'vitest';
import { assembleReportData, CHECK_ACTION_MAP } from './reportData';
import { HEALTH_SCORE_WEIGHTS, ADMIN_ROLE_WARNING_THRESHOLD } from './constants';
import type { HealthScore } from './healthScore';
import type { UserSummary } from './effectiveAccess';

function makeHealthScore(percentage: number, grade: 'A' | 'B' | 'C' | 'D' | 'F'): HealthScore {
  return {
    total: percentage,
    maxTotal: 100,
    percentage,
    grade,
    checks: [
      // passed=true when the check criterion is met (percentage high enough)
      { name: 'Capacity assigned', passed: percentage >= 80, points: percentage >= 80 ? 15 : 0, maxPoints: 15, detail: '' },
      { name: 'Description provided', passed: percentage >= 50, points: percentage >= 50 ? 10 : 0, maxPoints: 10, detail: '' },
    ],
  };
}

const BASE_PARAMS = {
  generatedAt: new Date('2026-04-06'),
  tenantScore: 75,
  tenantGrade: 'B' as const,
  healthMap: new Map([
    ['ws1', makeHealthScore(45, 'F')],
    ['ws2', makeHealthScore(60, 'D')],
    ['ws3', makeHealthScore(82, 'B')],
  ]),
  workspaces: [
    { id: 'ws1', displayName: 'Alpha' },
    { id: 'ws2', displayName: 'Beta' },
    { id: 'ws3', displayName: 'Gamma' },
  ] as unknown as import('@/api/types/workspace').Workspace[],
  userSummaries: [] as UserSummary[],
  securityPosture: null,
  riskySettings: [],
  settingsLoaded: false,
  widelySharedArtifacts: [],
  artifactsLoaded: false,
  ghostWorkspaces: [],
  activityLoaded: false,
};

describe('assembleReportData', () => {
  it('computes gradeDistribution from healthMap', () => {
    const data = assembleReportData(BASE_PARAMS);
    expect(data.gradeDistribution['F']).toBe(1);
    expect(data.gradeDistribution['D']).toBe(1);
    expect(data.gradeDistribution['B']).toBe(1);
    expect(data.gradeDistribution['A']).toBeUndefined();
  });

  it('worstWorkspaces is sorted by percentage ascending, max 5', () => {
    const data = assembleReportData(BASE_PARAMS);
    expect(data.worstWorkspaces[0].workspaceId).toBe('ws1');
    expect(data.worstWorkspaces[1].workspaceId).toBe('ws2');
    expect(data.worstWorkspaces.length).toBeLessThanOrEqual(5);
  });

  it('overassignedWorkspaceCount counts workspaces with admin count > threshold', () => {
    // Use THRESHOLD + 1 separate UserSummary objects, each with one admin assignment to 'ws1'
    // This unambiguously represents (threshold + 1) distinct admin principals on one workspace
    const summaries: UserSummary[] = Array.from(
      { length: ADMIN_ROLE_WARNING_THRESHOLD + 1 },
      (_, idx) => ({
        displayName: `Admin ${idx}`,
        email: `admin${idx}@test.com`,
        principalType: 'User' as const,
        assignments: [{ workspaceId: 'ws1', workspaceName: 'Alpha', role: 'Admin' as const }],
      }),
    );
    const data = assembleReportData({ ...BASE_PARAMS, userSummaries: summaries });
    expect(data.overassignedWorkspaceCount).toBe(1);
  });

  it('overassignedWorkspaceCount is 0 when no userSummaries', () => {
    const data = assembleReportData(BASE_PARAMS);
    expect(data.overassignedWorkspaceCount).toBe(0);
  });

  it('topRecommendations sorted by recoverablePoints descending', () => {
    const data = assembleReportData(BASE_PARAMS);
    for (let i = 1; i < data.topRecommendations.length; i++) {
      expect(data.topRecommendations[i - 1].recoverablePoints).toBeGreaterThanOrEqual(
        data.topRecommendations[i].recoverablePoints,
      );
    }
  });

  it('topRecommendations has at most 5 entries', () => {
    const data = assembleReportData(BASE_PARAMS);
    expect(data.topRecommendations.length).toBeLessThanOrEqual(5);
  });
});

describe('CHECK_ACTION_MAP', () => {
  it('covers all HEALTH_SCORE_WEIGHTS keys', () => {
    const weightKeys = Object.keys(HEALTH_SCORE_WEIGHTS) as Array<keyof typeof HEALTH_SCORE_WEIGHTS>;
    for (const key of weightKeys) {
      expect(CHECK_ACTION_MAP).toHaveProperty(key);
      expect(typeof CHECK_ACTION_MAP[key]).toBe('string');
    }
  });
});
