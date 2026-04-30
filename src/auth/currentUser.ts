import { msalInstance, isEffectiveDemoMode } from './AuthProvider';
import { DEMO_USER_UPN } from '@/utils/constants';

/**
 * Returns the current user's UPN for workspace identity matching.
 * Demo mode (incl. MSAL-configured but no signed-in account): returns the
 * alice persona. Live mode: reads from MSAL account cache. Plain function,
 * safe to call outside React render cycles.
 */
export function getCurrentUserEmail(): string | null {
  if (isEffectiveDemoMode()) return DEMO_USER_UPN;
  return msalInstance?.getAllAccounts()[0]?.username ?? null;
}
