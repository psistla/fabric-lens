import type { ReportData } from '@/utils/reportData';
import { GHOST_WORKSPACE_THRESHOLD_DAYS } from '@/utils/constants';

export function generateExecutiveSummary(data: ReportData): string {
  if (data.securityPosture === null) {
    return 'Run a security scan from the Security page to include risk findings in this summary.';
  }

  // 1. Risk posture
  const gradeFCount = data.gradeDistribution['F'] ?? 0;
  const highRiskCount = data.riskySettings.length;
  const secScore = data.securityPosture.score;

  let posture: string;
  if (secScore < 60 || gradeFCount >= 3) {
    posture = 'high risk';
  } else if (secScore < 75 || highRiskCount >= 1) {
    posture = 'medium-high governance risk';
  } else {
    posture = 'medium risk';
  }

  // 2. Top 2 material findings (weight: 3=high, 2=medium)
  const candidates: { text: string; weight: number }[] = [];

  if (data.ghostWorkspaces.length > 0) {
    const n = data.ghostWorkspaces.length;
    candidates.push({
      text: `${n} workspace${n !== 1 ? 's have' : ' has'} been inactive for over ${GHOST_WORKSPACE_THRESHOLD_DAYS} days`,
      weight: 3,
    });
  }
  if (highRiskCount > 0) {
    candidates.push({
      text: `${highRiskCount} high-risk tenant setting${highRiskCount !== 1 ? 's are' : ' is'} currently enabled`,
      weight: 3,
    });
  }
  if (data.overassignedWorkspaceCount > 0) {
    const n = data.overassignedWorkspaceCount;
    candidates.push({
      text: `${n} workspace${n !== 1 ? 's hold' : ' holds'} admin assignments exceeding the recommended threshold`,
      weight: 3,
    });
  }
  if (data.widelySharedArtifacts.length > 0) {
    const n = data.widelySharedArtifacts.length;
    candidates.push({
      text: `${n} artifact${n !== 1 ? 's are' : ' is'} shared with the entire organization`,
      weight: 2,
    });
  }
  if (gradeFCount > 0) {
    candidates.push({
      text: `${gradeFCount} workspace${gradeFCount !== 1 ? 's are' : ' is'} Grade F`,
      weight: 2,
    });
  }

  candidates.sort((a, b) => b.weight - a.weight);
  const topTwo = candidates.slice(0, 2).map(
    (f) => `${f.text.charAt(0).toUpperCase()}${f.text.slice(1)}.`,
  );

  // 3. Recommended action
  const rawAction = data.topRecommendations[0]?.action ?? 'Maintain current governance practices.';
  const action = rawAction.endsWith('.') ? rawAction : `${rawAction}.`;

  // 4. Assemble
  return [`This Fabric tenant carries ${posture}.`, ...topTwo, action].join(' ');
}
