import type { AccountInfo } from '@azure/msal-browser';
import { msalInstance } from '@/auth/AuthProvider';
import { GRAPH_SCOPES, DEFAULT_GRAPH_API_BASE, MAX_RETRY_COUNT } from '@/utils/constants';
import { isDemoMode } from '@/api/demo';
import { fetchWithTimeout, isValidGuid, retryDelayMs } from './fabricClient';
import type {
  ODataPagedResponse,
  GraphUser,
  GroupMember,
} from './types/roleAssignment';

// ---------------------------------------------------------------------------
// Graph API result types (mirrors AdminResult<T> pattern from admin.ts)
// ---------------------------------------------------------------------------

interface GraphSuccess<T> {
  success: true;
  data: T;
}

interface GraphAuthError {
  success: false;
  reason: 'consent_required';
  message: string;
}

interface GraphApiError {
  success: false;
  reason: 'error';
  message: string;
}

export type GraphResult<T> = GraphSuccess<T> | GraphAuthError | GraphApiError;

// ---------------------------------------------------------------------------
// Token acquisition — returns null instead of throwing on failure
// ---------------------------------------------------------------------------

async function getGraphToken(): Promise<string | null> {
  if (!msalInstance) return null;
  const accounts = msalInstance.getAllAccounts();
  const account: AccountInfo | undefined = accounts[0];
  if (!account) return null;

  try {
    const result = await msalInstance.acquireTokenSilent({
      scopes: GRAPH_SCOPES,
      account,
    });
    return result.accessToken;
  } catch {
    try {
      const result = await msalInstance.acquireTokenPopup({
        scopes: GRAPH_SCOPES,
      });
      return result.accessToken;
    } catch {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isConsentError(status: number, body: string): boolean {
  return (
    status === 403 ||
    body.includes('Authorization_RequestDenied') ||
    body.includes('consent_required') ||
    body.includes('interaction_required')
  );
}

/** GET with the Graph consistency header, a timeout, and bounded retry on 429. */
async function graphGet(url: string, token: string, retryCount = 0): Promise<Response> {
  const response = await fetchWithTimeout(url, token, { ConsistencyLevel: 'eventual' });
  if (response.status !== 429 || retryCount >= MAX_RETRY_COUNT) return response;
  await new Promise((resolve) =>
    setTimeout(resolve, retryDelayMs(response.headers.get('Retry-After'), retryCount)),
  );
  return graphGet(url, token, retryCount + 1);
}

function invalidGroupId<T>(groupId: string): GraphResult<T> {
  return { success: false, reason: 'error', message: `Invalid group ID: "${groupId}"` };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the transitive member count for a security group.
 *
 * Calls: GET /groups/{id}/transitiveMembers/$count
 * Requires header: ConsistencyLevel: eventual
 * Response is plain text (integer), not JSON.
 */
export async function getGroupMemberCount(
  groupId: string,
): Promise<GraphResult<number>> {
  if (isDemoMode) {
    throw new Error(
      'graphClient: API call attempted in demo mode. ' +
      'This is a bug. Demo mode should use mock data exclusively.',
    );
  }
  // Security: validate GUID before path interpolation, as the Fabric client does.
  if (!isValidGuid(groupId)) return invalidGroupId(groupId);
  const token = await getGraphToken();
  if (!token) {
    return {
      success: false,
      reason: 'consent_required',
      message:
        'Graph API consent required. Grant GroupMember.Read.All permission to resolve group membership.',
    };
  }

  const url = `${DEFAULT_GRAPH_API_BASE}/groups/${groupId}/transitiveMembers/$count`;

  try {
    const response = await graphGet(url, token);

    const body = await response.text();

    if (!response.ok) {
      if (isConsentError(response.status, body)) {
        return {
          success: false,
          reason: 'consent_required',
          message:
            'Graph API access denied. Grant GroupMember.Read.All permission to resolve group membership.',
        };
      }
      return {
        success: false,
        reason: 'error',
        message: `Failed to get group member count: ${response.status} ${response.statusText}`,
      };
    }

    const count = parseInt(body, 10);
    if (isNaN(count)) {
      if (import.meta.env.DEV) {
        console.warn('[GraphClient] Unexpected $count response:', body);
      }
      return {
        success: false,
        reason: 'error',
        message: 'Unexpected response from the Graph API.',
      };
    }

    return { success: true, data: count };
  } catch (e) {
    return {
      success: false,
      reason: 'error',
      message: e instanceof Error ? e.message : 'Failed to get group member count',
    };
  }
}

/**
 * Get all transitive user members of a security group.
 *
 * Calls: GET /groups/{id}/transitiveMembers/microsoft.graph.user?$select=...&$count=true
 * Requires header: ConsistencyLevel: eventual
 * Handles OData @odata.nextLink pagination.
 */
export async function getGroupMembers(
  groupId: string,
): Promise<GraphResult<GroupMember[]>> {
  if (isDemoMode) {
    throw new Error(
      'graphClient: API call attempted in demo mode. ' +
      'This is a bug. Demo mode should use mock data exclusively.',
    );
  }
  if (!isValidGuid(groupId)) return invalidGroupId(groupId);
  const token = await getGraphToken();
  if (!token) {
    return {
      success: false,
      reason: 'consent_required',
      message:
        'Graph API consent required. Grant GroupMember.Read.All permission to resolve group membership.',
    };
  }

  const members: GroupMember[] = [];
  let url: string | null =
    `${DEFAULT_GRAPH_API_BASE}/groups/${groupId}/transitiveMembers/microsoft.graph.user` +
    `?$select=id,displayName,userPrincipalName,jobTitle&$count=true`;

  try {
    while (url) {
      const response = await graphGet(url, token);

      if (!response.ok) {
        const body = await response.text();
        if (isConsentError(response.status, body)) {
          return {
            success: false,
            reason: 'consent_required',
            message:
              'Graph API access denied. Grant GroupMember.Read.All permission to resolve group membership.',
          };
        }
        return {
          success: false,
          reason: 'error',
          message: `Failed to get group members: ${response.status} ${response.statusText}`,
        };
      }

      const data = (await response.json()) as ODataPagedResponse<GraphUser>;

      for (const user of data.value) {
        members.push({
          id: user.id,
          displayName: user.displayName,
          userPrincipalName: user.userPrincipalName,
          jobTitle: user.jobTitle ?? undefined,
        });
      }

      url = data['@odata.nextLink'] ?? null;
    }

    return { success: true, data: members };
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[GraphClient] getGroupMembers error:', e);
    }
    return {
      success: false,
      reason: 'error',
      message: 'Unable to load group members. Please try again.',
    };
  }
}
