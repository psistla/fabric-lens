import type { SecurityFinding } from './securityFindings';

export type SecurityAreaId = 'access' | 'sharing' | 'settings' | 'lifecycle';

export interface SecurityAreaSignal {
  /** Stable key, used for React keys and for routing a drill-in to its panel. */
  key: string;
  label: string;
  count: number;
}

export interface SecurityArea {
  id: SecurityAreaId;
  title: string;
  /** What this area answers, shown under the title on the summary tile. */
  question: string;
  /** Headline number: the sum of the member signal counts. */
  count: number;
  signals: SecurityAreaSignal[];
  /** Findings whose rule belongs to this area, for the drill-in view. */
  findingIds: string[];
}

export interface SecurityAreaInput {
  findings: SecurityFinding[];
  overPermissionedCount: number;
  spofCount: number;
  spnElevatedCount: number;
  riskySettingsCount: number;
  widelySharedCount: number;
  unassignedDomainCount: number;
  ghostCount: number;
}

/**
 * Which area each finding rule belongs to. Finding IDs come from
 * `deriveSecurityFindings`; anything unmapped falls through to Access, which is
 * where the access-control rules live and where a new rule most likely belongs.
 */
const FINDING_AREA: Record<string, SecurityAreaId> = {
  'spof-single-admin': 'access',
  'no-admin-workspace': 'access',
  'spn-admin-role': 'access',
  'over-permissioned-users': 'access',
  'unresolved-admin-groups': 'access',
  'over-administered-workspaces': 'access',
  'unresolved-groups': 'access',
};

/**
 * Group the twelve derived security signals into the four areas the Security
 * page drills into.
 *
 * The headline `count` deliberately sums only the signal counts, not the
 * findings: a finding is a rule firing ABOUT those same signals, so counting
 * both would inflate every area by double-reporting the same problem.
 */
export function groupSecurityAreas(input: SecurityAreaInput): SecurityArea[] {
  const areas: Omit<SecurityArea, 'count' | 'findingIds'>[] = [
    {
      id: 'access',
      title: 'Access',
      question: 'Who can reach what, and is anyone over-privileged?',
      signals: [
        {
          key: 'over-permissioned',
          label: 'Over-permissioned users',
          count: input.overPermissionedCount,
        },
        { key: 'spof', label: 'Single-admin workspaces', count: input.spofCount },
        {
          key: 'spn',
          label: 'Service principals with elevated roles',
          count: input.spnElevatedCount,
        },
      ],
    },
    {
      id: 'sharing',
      title: 'Sharing',
      question: 'What has left its workspace boundary?',
      signals: [
        {
          key: 'widely-shared',
          label: 'Items shared with the whole organization',
          count: input.widelySharedCount,
        },
        {
          key: 'unassigned-domain',
          label: 'Workspaces outside any domain',
          count: input.unassignedDomainCount,
        },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      question: 'Which tenant settings widen the blast radius?',
      signals: [
        {
          key: 'risky-settings',
          label: 'High-risk tenant settings enabled',
          count: input.riskySettingsCount,
        },
      ],
    },
    {
      id: 'lifecycle',
      title: 'Lifecycle',
      question: 'What is still provisioned but no longer used?',
      signals: [
        { key: 'ghost', label: 'Inactive workspaces', count: input.ghostCount },
      ],
    },
  ];

  return areas.map((area) => ({
    ...area,
    count: area.signals.reduce((sum, s) => sum + s.count, 0),
    findingIds: input.findings
      .filter((f) => (FINDING_AREA[f.id] ?? 'access') === area.id)
      .map((f) => f.id),
  }));
}
