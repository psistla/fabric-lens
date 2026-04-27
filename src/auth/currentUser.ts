import { msalInstance } from './AuthProvider';
import { isDemoMode } from '@/api/demo';
import { DEMO_USER_UPN } from '@/utils/constants';

/**
 * Returns the current user's UPN for workspace identity matching.
 * Demo mode: returns the alice persona. Live mode: reads from MSAL account
 * cache — no React hook, safe to call outside component render cycles.
 */
export function getCurrentUserEmail(): string | null {
  if (isDemoMode) return DEMO_USER_UPN;
  return msalInstance?.getAllAccounts()[0]?.username ?? null;
}
