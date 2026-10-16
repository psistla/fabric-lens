// Shape of GET /v1/admin/workspaces/networking/communicationpolicies (Fabric admin API).
// Sub-objects are optional: the reference sample omits `firewall` for open workspaces.

export type NetworkAction = 'Allow' | 'Deny';

interface NetworkRules {
  defaultAction: NetworkAction;
}

export interface OutboundConnectionRule {
  connectionType: string;
  defaultAction: NetworkAction;
  allowedEndpoints?: { hostnamePattern: string }[];
  allowedWorkspaces?: { workspaceId: string }[];
}

export interface ManagedPrivateEndpoint {
  id: string;
  name: string;
  targetPrivateLinkResourceId: string;
  targetSubresourceType: string;
  provisioningState: string;
  connectionState: { status: string; description?: string; actionsRequired?: string };
}

export interface NetworkCommunicationPolicy {
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  inbound?: {
    publicAccessRules?: NetworkRules;
    firewall?: { rules: { displayName: string; value: string }[] };
  };
  outbound?: {
    publicAccessRules?: NetworkRules;
    connections?: { defaultAction: NetworkAction; rules: OutboundConnectionRule[] };
    gateways?: { defaultAction: NetworkAction; allowedGateways: { id: string }[] };
    git?: NetworkRules;
    managedPrivateEndpoints?: ManagedPrivateEndpoint[];
  };
}
