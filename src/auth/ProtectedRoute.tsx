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
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-gray-500">Authenticating...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Fabric Lens</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your Microsoft Fabric tenant.
          </p>
          <button
            onClick={() => void login()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#0078d4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#106ebe] transition-colors"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
