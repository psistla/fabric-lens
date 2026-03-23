import type { ReactNode } from 'react';
import { isDemoMode } from '@/api/demo';
import { useAuth } from './useAuth';

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isDemoMode) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--m-bg)]">
        <div className="text-sm text-[var(--m-text-secondary)]">Authenticating...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--m-surface)]">
        <div className="w-full max-w-sm rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-8 shadow-[var(--m-shadow-md)]">
          <h1 className="text-xl font-semibold text-[var(--m-text)]">Fabric Lens</h1>
          <p className="mt-2 text-sm text-[var(--m-text-secondary)]">
            Sign in to manage your Microsoft Fabric tenant.
          </p>
          <button
            onClick={() => void login()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--m-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--m-primary-hover)]"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
