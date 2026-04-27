import { describe, it, expect } from 'vitest';
import type { WorkspaceUser } from '@/api/types/admin';
import { getMyWorkspaceIds } from './myWorkspaces';

const makeUser = (upn: string, role: string = 'Member'): WorkspaceUser => ({
  userDetails: { userPrincipalName: upn, displayName: upn },
  workspaceAccessDetails: { workspaceRole: role as never },
});

describe('getMyWorkspaceIds', () => {
  it('returns empty set when workspaceUsers is empty', () => {
    const result = getMyWorkspaceIds('alice@contoso.com', {});
    expect(result.size).toBe(0);
  });

  it('returns workspace IDs where the user has an assignment', () => {
    const users = {
      'ws-1': [makeUser('alice@contoso.com', 'Admin'), makeUser('bob@contoso.com')],
      'ws-2': [makeUser('bob@contoso.com')],
      'ws-3': [makeUser('alice@contoso.com', 'Viewer')],
    };
    const result = getMyWorkspaceIds('alice@contoso.com', users);
    expect(result.has('ws-1')).toBe(true);
    expect(result.has('ws-2')).toBe(false);
    expect(result.has('ws-3')).toBe(true);
    expect(result.size).toBe(2);
  });

  it('is case-insensitive for email matching', () => {
    const users = {
      'ws-1': [makeUser('Alice@Contoso.com')],
    };
    const result = getMyWorkspaceIds('alice@contoso.com', users);
    expect(result.has('ws-1')).toBe(true);
  });

  it('returns empty set when userEmail is null', () => {
    const users = { 'ws-1': [makeUser('alice@contoso.com')] };
    const result = getMyWorkspaceIds(null, users);
    expect(result.size).toBe(0);
  });

  it('skips entries with null/undefined UPN gracefully', () => {
    const users = {
      'ws-1': [
        { userDetails: { userPrincipalName: null as unknown as string, displayName: 'SPN' }, workspaceAccessDetails: { workspaceRole: 'Member' as never } },
        makeUser('alice@contoso.com'),
      ],
    };
    const result = getMyWorkspaceIds('alice@contoso.com', users);
    expect(result.has('ws-1')).toBe(true);
  });
});
