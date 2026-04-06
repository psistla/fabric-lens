import type { ReactNode } from 'react';
import { isMsalConfigured } from '@/api/demo';
import { useAuth } from './useAuth';

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isLoading } = useAuth();

  // While MSAL is initialising on a configured deployment, show a brief
  // loading screen so stores don't start fetching before auth state is known.
  if (isMsalConfigured && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--m-bg)]">
        <div className="text-sm text-[var(--m-text-secondary)]">Authenticating...</div>
      </div>
    );
  }

  // Always render the app. Unauthenticated visitors see demo data (via
  // isEffectiveDemoMode() in the stores). Authenticated users see live data.
  return <>{children}</>;
}
