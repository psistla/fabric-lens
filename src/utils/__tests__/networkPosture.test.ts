import { describe, it, expect } from 'vitest';
import type { NetworkCommunicationPolicy } from '@/api/types/networkPolicy';
import { toNetworkRow, summarizeNetwork } from '../networkPosture';

const base = { workspaceId: 'w', workspaceName: 'W', workspaceType: 'Workspace' };

describe('toNetworkRow', () => {
  it('treats absent rules as Allow, so an empty policy is open', () => {
    expect(toNetworkRow({ ...base }).posture).toBe('open');
    expect(toNetworkRow({ ...base, inbound: {}, outbound: {} }).posture).toBe('open');
  });

  it('classifies each combination of inbound and outbound deny', () => {
    const inDeny = { inbound: { publicAccessRules: { defaultAction: 'Deny' as const } } };
    const outDeny = { outbound: { publicAccessRules: { defaultAction: 'Deny' as const } } };
    expect(toNetworkRow({ ...base, ...inDeny, ...outDeny }).posture).toBe('isolated');
    expect(toNetworkRow({ ...base, ...inDeny }).posture).toBe('inbound-only');
    expect(toNetworkRow({ ...base, ...outDeny }).posture).toBe('outbound-only');
  });

  it('counts firewall rules and managed private endpoints', () => {
    const p: NetworkCommunicationPolicy = {
      ...base,
      inbound: { firewall: { rules: [{ displayName: 'a', value: '1.1.1.1-2.2.2.2' }] } },
      outbound: {
        managedPrivateEndpoints: [
          {
            id: 'e',
            name: 'n',
            targetPrivateLinkResourceId: '/r',
            targetSubresourceType: 'sqlServer',
            provisioningState: 'Succeeded',
            connectionState: { status: 'Approved' },
          },
        ],
      },
    };
    const row = toNetworkRow(p);
    expect(row.firewallRules).toBe(1);
    expect(row.privateEndpoints).toBe(1);
  });

  it('flags Git left open while outbound is denied', () => {
    const row = toNetworkRow({
      ...base,
      outbound: {
        publicAccessRules: { defaultAction: 'Deny' },
        git: { defaultAction: 'Allow' },
      },
    });
    expect(row.gitAllowedUnderDeny).toBe(true);
    expect(toNetworkRow({ ...base }).gitAllowedUnderDeny).toBe(false);
  });
});

describe('summarizeNetwork', () => {
  it('counts postures and the protected share', () => {
    const deny = { defaultAction: 'Deny' as const };
    const rows = [
      toNetworkRow({ ...base, workspaceId: '1', inbound: { publicAccessRules: deny }, outbound: { publicAccessRules: deny } }),
      toNetworkRow({ ...base, workspaceId: '2', outbound: { publicAccessRules: deny } }),
      toNetworkRow({ ...base, workspaceId: '3' }),
      toNetworkRow({ ...base, workspaceId: '4' }),
    ];
    expect(summarizeNetwork(rows)).toEqual({
      total: 4,
      isolated: 1,
      inboundOnly: 0,
      outboundOnly: 1,
      open: 2,
      protectedPct: 50,
    });
  });

  it('does not divide by zero', () => {
    expect(summarizeNetwork([]).protectedPct).toBe(0);
  });
});
