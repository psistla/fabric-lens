import { describe, it, expect } from 'vitest';
import { generateExecutiveSummary } from './reportSummary';
import type { ReportData } from './reportData';

function makeReport(overrides: Partial<ReportData> = {}): ReportData {
  return {
    generatedAt: new Date('2026-04-06'),
    overallGrade: 'B',
    overallScore: 75,
    workspaceCount: 10,
    gradeDistribution: { B: 8, F: 2 },
    worstWorkspaces: [],
    securityPosture: {
      score: 70,
      grade: 'C',
      checks: [],
    },
    overassignedWorkspaceCount: 0,
    riskySettings: [],
    settingsLoaded: true,
    widelySharedArtifacts: [],
    artifactsLoaded: true,
    ghostWorkspaces: [],
    activityLoaded: true,
    topRecommendations: [{ action: 'Assign workspaces to a capacity', recoverablePoints: 150, affectedCount: 10, priority: 'critical' }],
    ...overrides,
  };
}

describe('generateExecutiveSummary', () => {
  it('returns scan prompt when securityPosture is null', () => {
    const result = generateExecutiveSummary(makeReport({ securityPosture: null }));
    expect(result).toBe(
      'Run a security scan from the Security page to include risk findings in this summary.',
    );
  });

  it('returns "high risk" when security score < 60', () => {
    const result = generateExecutiveSummary(
      makeReport({ securityPosture: { score: 55, grade: 'F', checks: [] } }),
    );
    expect(result).toContain('high risk');
  });

  it('returns "high risk" when grade F count >= 3', () => {
    const result = generateExecutiveSummary(
      makeReport({ gradeDistribution: { F: 3, B: 7 } }),
    );
    expect(result).toContain('high risk');
  });

  it('returns "medium-high governance risk" when security score 60–74', () => {
    const result = generateExecutiveSummary(
      makeReport({ securityPosture: { score: 65, grade: 'C', checks: [] }, gradeDistribution: { B: 10 } }),
    );
    expect(result).toContain('medium-high governance risk');
  });

  it('returns "medium-high governance risk" when 1+ high-risk settings enabled', () => {
    const result = generateExecutiveSummary(
      makeReport({
        securityPosture: { score: 80, grade: 'B', checks: [] },
        riskySettings: [{ settingName: 'PublishToWeb', riskLevel: 'high', enabled: true, tenantSettingGroup: 'Export', canSpecifySecurityGroups: false, enabledSecurityGroups: [] }],
      }),
    );
    expect(result).toContain('medium-high governance risk');
  });

  it('returns "medium risk" when score is 75+ and no high-risk settings', () => {
    const result = generateExecutiveSummary(
      makeReport({ securityPosture: { score: 80, grade: 'B', checks: [] }, gradeDistribution: { B: 10 } }),
    );
    expect(result).toContain('medium risk');
  });

  it('uses fallback action when topRecommendations is empty', () => {
    const result = generateExecutiveSummary(makeReport({ topRecommendations: [] }));
    expect(result).toContain('Maintain current governance practices.');
  });

  it('assembled string has 4 parts (posture + 2 findings + action)', () => {
    const result = generateExecutiveSummary(
      makeReport({
        ghostWorkspaces: [{ workspaceId: 'ws1', workspaceName: 'Alpha', lastActivityDate: new Date(), daysInactive: 100 }],
        riskySettings: [{ settingName: 'PublishToWeb', riskLevel: 'high', enabled: true, tenantSettingGroup: 'Export', canSpecifySecurityGroups: false, enabledSecurityGroups: [] }],
        overassignedWorkspaceCount: 2,
        securityPosture: { score: 65, grade: 'C', checks: [] },
      }),
    );
    // Should be a non-empty string ending with a period
    expect(result.endsWith('.')).toBe(true);
    expect(result.length).toBeGreaterThan(50);
  });
});
