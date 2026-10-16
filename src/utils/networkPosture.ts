import type { NetworkCommunicationPolicy } from '@/api/types/networkPolicy';

export type NetworkPosture = 'isolated' | 'inbound-only' | 'outbound-only' | 'open';

export interface NetworkRow {
  workspaceId: string;
  workspaceName: string;
  posture: NetworkPosture;
  inboundDenied: boolean;
  outboundDenied: boolean;
  firewallRules: number;
  privateEndpoints: number;
  /** Outbound is denied but Git is still allowed, a deliberate exception worth seeing. */
  gitAllowedUnderDeny: boolean;
}

export interface NetworkSummary {
  total: number;
  isolated: number;
  inboundOnly: number;
  outboundOnly: number;
  open: number;
  /** Share of workspaces with at least one direction denied, 0 to 100. */
  protectedPct: number;
}

// An absent rule means the service applies its default, which is Allow.
const denied = (rule?: { defaultAction: string }): boolean => rule?.defaultAction === 'Deny';

export function toNetworkRow(p: NetworkCommunicationPolicy): NetworkRow {
  const inboundDenied = denied(p.inbound?.publicAccessRules);
  const outboundDenied = denied(p.outbound?.publicAccessRules);
  const posture: NetworkPosture =
    inboundDenied && outboundDenied
      ? 'isolated'
      : inboundDenied
        ? 'inbound-only'
        : outboundDenied
          ? 'outbound-only'
          : 'open';
  return {
    workspaceId: p.workspaceId,
    workspaceName: p.workspaceName,
    posture,
    inboundDenied,
    outboundDenied,
    firewallRules: p.inbound?.firewall?.rules.length ?? 0,
    privateEndpoints: p.outbound?.managedPrivateEndpoints?.length ?? 0,
    gitAllowedUnderDeny: outboundDenied && !denied(p.outbound?.git),
  };
}

export function summarizeNetwork(rows: NetworkRow[]): NetworkSummary {
  const count = (posture: NetworkPosture) => rows.filter((r) => r.posture === posture).length;
  const open = count('open');
  return {
    total: rows.length,
    isolated: count('isolated'),
    inboundOnly: count('inbound-only'),
    outboundOnly: count('outbound-only'),
    open,
    protectedPct: rows.length === 0 ? 0 : Math.round(((rows.length - open) / rows.length) * 100),
  };
}
