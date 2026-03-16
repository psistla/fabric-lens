import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus, InteractionRequiredAuthError } from '@azure/msal-browser';
import { fabricLoginRequest } from './msalConfig';
import { GRAPH_SCOPES, SESSION_IDLE_TIMEOUT_MS } from '@/utils/constants';
import { useToastStore } from '@/components/shared/Toast';

// Module-level timestamp shared across all useAuth instances.
let lastActivityAt = Date.now();

/** Reset the idle timeout clock. Pages should call this on meaningful user interactions. */
export function resetActivityTimer(): void {
  lastActivityAt = Date.now();
}

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

    if (Date.now() - lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
      try {
        await logout();
      } catch {
        // Ignore logout errors — session is expired regardless.
      }
      useToastStore
        .getState()
        .addToast('error', 'Session expired due to inactivity. Please sign in again.');
      throw new Error('Session expired due to inactivity.');
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
    } catch (err) {
      // Only prompt via popup when interaction is explicitly required
      // (e.g. consent needed, MFA challenge). Silent-fail all other errors.
      if (err instanceof InteractionRequiredAuthError) {
        try {
          const result = await instance.acquireTokenPopup({
            scopes: GRAPH_SCOPES,
          });
          return result.accessToken;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  return { isAuthenticated, user, login, logout, getToken, getGraphToken, isLoading };
}
