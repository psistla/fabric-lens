import { vi, describe, it, expect } from 'vitest';

// Mock isDemoMode = true before any module under test is imported.
vi.mock('@/api/demo', () => ({ isDemoMode: true }));

// Prevent MSAL from instantiating with undefined credentials in test env.
vi.mock('@/auth/AuthProvider', () => ({ msalInstance: null }));

import { FabricClient } from '@/api/fabricClient';
import { getGroupMemberCount, getGroupMembers } from '@/api/graphClient';
import type { IPublicClientApplication } from '@azure/msal-browser';

const DEMO_ERROR_SUBSTR = 'demo mode';

describe('Demo mode guards', () => {
  const client = new FabricClient({} as IPublicClientApplication);

  it('fabricClient.get() throws in demo mode', async () => {
    await expect(client.get('/test')).rejects.toThrow(DEMO_ERROR_SUBSTR);
  });

  it('fabricClient.post() throws in demo mode', async () => {
    await expect(client.post('/test', {})).rejects.toThrow(DEMO_ERROR_SUBSTR);
  });

  it('getGroupMemberCount() throws in demo mode', async () => {
    await expect(getGroupMemberCount('group-1')).rejects.toThrow(DEMO_ERROR_SUBSTR);
  });

  it('getGroupMembers() throws in demo mode', async () => {
    await expect(getGroupMembers('group-1')).rejects.toThrow(DEMO_ERROR_SUBSTR);
  });
});
