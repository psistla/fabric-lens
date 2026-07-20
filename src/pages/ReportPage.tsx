import { useMemo } from 'react';
import { Link } from 'react-router';
import { Printer } from 'lucide-react';
import { LensMark } from '@/components/shared/LensMark';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useSecurityStore } from '@/store/securityStore';
import { useTenantSettingsStore } from '@/store/tenantSettingsStore';
import { useWidelySharedStore } from '@/store/widelySharedStore';
import { useActivityStore } from '@/store/activityStore';
import { calculateWorkspaceHealth, type HealthGrade } from '@/utils/healthScore';
import { computeSecurityPosture } from '@/utils/securityFindings';
import type { UserSummary } from '@/utils/effectiveAccess';
import { deriveRiskySettings } from '@/utils/tenantSettingRisks';
import { assembleReportData } from '@/utils/reportData';
import { generateExecutiveSummary } from '@/utils/reportSummary';
import { GRADE_THRESHOLDS } from '@/utils/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ReportCover } from '@/components/report/ReportCover';
import { ExecutiveSummarySection } from '@/components/report/ExecutiveSummarySection';
import { HealthSection } from '@/components/report/HealthSection';
import { SecuritySection } from '@/components/report/SecuritySection';
import { TenantSettingsSection } from '@/components/report/TenantSettingsSection';
import { WidelySharedSection } from '@/components/report/WidelySharedSection';
import { GhostWorkspacesSection } from '@/components/report/GhostWorkspacesSection';
import { RecommendationsSection } from '@/components/report/RecommendationsSection';

function getGrade(score: number): HealthGrade {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

export function ReportPage() {
  useDocumentTitle('Governance Report');
  const { workspaces, allItemsByWorkspace } = useWorkspaceStore();
  const { workspaceUsers, resolvedGroups } = useSecurityStore();
  const { settings, error: settingsError } = useTenantSettingsStore();
  const { artifacts, error: widelySharedError } = useWidelySharedStore();
  const { ghostWorkspaces, lastFetchedAt } = useActivityStore();

  // --- Health ---
  const healthMap = useMemo(
    () =>
      new Map(
        workspaces.map((ws) => [ws.id, calculateWorkspaceHealth(ws, allItemsByWorkspace[ws.id] ?? [])]),
      ),
    [workspaces, allItemsByWorkspace],
  );

  const { tenantScore, tenantGrade } = useMemo(() => {
    if (healthMap.size === 0) return { tenantScore: 0, tenantGrade: 'F' as HealthGrade };
    const scores = [...healthMap.values()].map((h) => h.percentage);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { tenantScore: avg, tenantGrade: getGrade(avg) };
  }, [healthMap]);

  // --- Security ---
  const hasScanned = Object.keys(workspaceUsers).length > 0;

  const userSummaries = useMemo((): UserSummary[] => {
    const map = new Map<string, UserSummary>();
    for (const [wsId, users] of Object.entries(workspaceUsers)) {
      const wsName = workspaces.find((w) => w.id === wsId)?.displayName ?? wsId;
      for (const u of users) {
        const email = u.userDetails.userPrincipalName;
        const pType = u.userDetails.principalType ?? 'User';
        let summary = map.get(email);
        if (!summary) {
          summary = { displayName: u.userDetails.displayName, email, principalType: pType, assignments: [] };
          map.set(email, summary);
        }
        summary.assignments.push({
          workspaceId: wsId,
          workspaceName: wsName,
          role: u.workspaceAccessDetails.workspaceRole,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.assignments.length - a.assignments.length);
  }, [workspaceUsers, workspaces]);

  const securityPosture = useMemo(
    () => (hasScanned ? computeSecurityPosture(userSummaries, resolvedGroups) : null),
    [hasScanned, userSummaries, resolvedGroups],
  );

  // --- Risky settings ---
  const riskySettings = useMemo(() => deriveRiskySettings(settings), [settings]);

  // --- Loaded flags ---
  const settingsLoaded = settings.length > 0 || settingsError !== null;
  const artifactsLoaded = artifacts.length > 0 || widelySharedError !== null;
  const activityLoaded = lastFetchedAt !== null;

  // --- Report data ---
  const reportData = useMemo(
    () =>
      assembleReportData({
        generatedAt: new Date(),
        tenantScore,
        tenantGrade,
        healthMap,
        workspaces,
        userSummaries,
        securityPosture,
        riskySettings,
        settingsLoaded,
        widelySharedArtifacts: artifacts,
        artifactsLoaded,
        ghostWorkspaces,
        activityLoaded,
      }),
    [tenantScore, tenantGrade, healthMap, workspaces, userSummaries, securityPosture,
     riskySettings, settingsLoaded, artifacts, artifactsLoaded, ghostWorkspaces, activityLoaded],
  );

  const executiveSummary = useMemo(
    () => generateExecutiveSummary(reportData),
    [reportData],
  );

  return (
    <div className="min-h-screen bg-[var(--m-bg)]">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-[var(--m-surface)] border-b border-[var(--m-border)] px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LensMark className="h-5 w-5" />
          <span className="text-sm font-semibold text-[var(--m-text)]">fabric-lens</span>
          <span className="text-sm text-[var(--m-text-secondary)]">/ Report</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="text-sm px-3 py-1.5 rounded-md border border-[var(--m-border)] text-[var(--m-text-secondary)] hover:text-[var(--m-text)]"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-[var(--m-primary-600)] text-white hover:opacity-90"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Report body */}
      <div className="max-w-4xl mx-auto mt-6 mb-12 shadow-lg print:max-w-none print:mt-0 print:shadow-none">
        <ReportCover data={reportData} />
        <ExecutiveSummarySection summary={executiveSummary} />
        <HealthSection
          gradeDistribution={reportData.gradeDistribution}
          worstWorkspaces={reportData.worstWorkspaces}
        />
        <SecuritySection securityPosture={reportData.securityPosture} />
        <TenantSettingsSection
          riskySettings={reportData.riskySettings}
          settingsLoaded={reportData.settingsLoaded}
        />
        <WidelySharedSection
          artifacts={reportData.widelySharedArtifacts}
          artifactsLoaded={reportData.artifactsLoaded}
        />
        <GhostWorkspacesSection
          ghostWorkspaces={reportData.ghostWorkspaces}
          activityLoaded={reportData.activityLoaded}
        />
        <RecommendationsSection topRecommendations={reportData.topRecommendations} />
      </div>
    </div>
  );
}
