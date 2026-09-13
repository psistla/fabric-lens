import { describe, it, expect, vi } from 'vitest';
import { createAdminApi } from '@/api/admin';
import type { FabricClient } from '@/api/fabricClient';

const WS = 'f089354e-8366-4e18-aea3-4cb4a3a50b48';

// Sample response from the List Workspace Access Details reference page.
const sample = {
  accessDetails: [
    {
      principal: {
        id: 'f3052d1c-61a9-46fb-8df9-0d78916ae041',
        displayName: 'Jacob Hancock',
        type: 'User',
        userDetails: { userPrincipalName: 'jacob@example.com' },
      },
      workspaceAccessDetails: { type: 'Workspace', workspaceRole: 'Admin' },
    },
    {
      principal: {
        id: 'f51b705f-a409-4d40-9197-c5d5f349e2f0',
        displayName: 'TestSecurityGroup',
        type: 'Group',
        groupDetails: { groupType: 'SecurityGroup' },
      },
      workspaceAccessDetails: { type: 'Workspace', workspaceRole: 'Contributor' },
    },
    {
      principal: {
        id: '0b7c9c2a-1111-4a5b-9d3e-aaaaaaaaaaaa',
        displayName: 'ETL App',
        type: 'ServicePrincipal',
        servicePrincipalDetails: { aadAppId: '9e8d7c6b-2222-4f3a-8b1c-bbbbbbbbbbbb' },
      },
      workspaceAccessDetails: { type: 'Workspace', workspaceRole: 'Viewer' },
    },
  ],
};

function apiWith(get: FabricClient['get']) {
  return createAdminApi({ get } as unknown as FabricClient);
}

describe('getWorkspaceUsers', () => {
  it('maps accessDetails[].principal to WorkspaceUser', async () => {
    const api = apiWith(vi.fn().mockResolvedValue(sample));
    const result = await api.getWorkspaceUsers(WS);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual([
      {
        id: 'f3052d1c-61a9-46fb-8df9-0d78916ae041',
        userDetails: {
          userPrincipalName: 'jacob@example.com',
          displayName: 'Jacob Hancock',
          principalType: 'User',
        },
        workspaceAccessDetails: { workspaceRole: 'Admin' },
      },
      {
        id: 'f51b705f-a409-4d40-9197-c5d5f349e2f0',
        userDetails: {
          userPrincipalName: null,
          displayName: 'TestSecurityGroup',
          principalType: 'Group',
        },
        workspaceAccessDetails: { workspaceRole: 'Contributor' },
        groupDetails: { groupType: 'SecurityGroup' },
      },
      {
        id: '0b7c9c2a-1111-4a5b-9d3e-aaaaaaaaaaaa',
        userDetails: {
          userPrincipalName: null,
          displayName: 'ETL App',
          principalType: 'ServicePrincipal',
        },
        workspaceAccessDetails: { workspaceRole: 'Viewer' },
        servicePrincipalDetails: { aadAppId: '9e8d7c6b-2222-4f3a-8b1c-bbbbbbbbbbbb' },
      },
    ]);
  });

  it('returns an empty list when accessDetails is missing', async () => {
    const api = apiWith(vi.fn().mockResolvedValue({}));
    const result = await api.getWorkspaceUsers(WS);
    expect(result).toEqual({ success: true, data: [] });
  });
});
