import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { fabricLoginRequest } from './msalConfig';
import { GRAPH_SCOPES } from '@/utils/constants';

interface AuthUser {
  name: string;
  email: string;
  tenantId: string;
}

export function useAuth() {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const account = accounts[0] ?? null;

  const user: AuthUser | null = account
    ? {
        name: account.name ?? '',
        email: account.username,
        tenantId: account.tenantId,
      }
    : null;

  const isLoading = inProgress !== InteractionStatus.None;

  async function login(): Promise<void> {
    try {
      await instance.loginPopup(fabricLoginRequest);
    } catch {
      await instance.loginRedirect(fabricLoginRequest);
    }
  }

  async function logout(): Promise<void> {
    await instance.logoutPopup({
      account: account,
    });
  }

  async function getToken(scopes: string[]): Promise<string> {
    if (!account) {
      throw new Error('No active account. Please sign in first.');
    }

    try {
      const result = await instance.acquireTokenSilent({
        scopes,
        account,
      });
      return result.accessToken;
    } catch {
      const result = await instance.acquireTokenPopup({ scopes });
      return result.accessToken;
    }
  }

  async function getGraphToken(): Promise<string | null> {
    if (!account) return null;

    try {
      const result = await instance.acquireTokenSilent({
        scopes: GRAPH_SCOPES,
        account,
      });
      return result.accessToken;
    } catch {
      try {
        const result = await instance.acquireTokenPopup({
          scopes: GRAPH_SCOPES,
        });
        return result.accessToken;
      } catch {
        return null;
      }
    }
  }

  return { isAuthenticated, user, login, logout, getToken, getGraphToken, isLoading };
}
