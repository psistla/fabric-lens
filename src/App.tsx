import { Routes, Route } from 'react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { DashboardPage } from '@/pages/DashboardPage';
import { WorkspacesPage } from '@/pages/WorkspacesPage';
import { WorkspaceDetailPage } from '@/pages/WorkspaceDetailPage';
import { CapacityPage } from '@/pages/CapacityPage';
import { SecurityPage } from '@/pages/SecurityPage';
import { SettingsPage } from '@/pages/SettingsPage';

export function App() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/workspaces" element={<WorkspacesPage />} />
            <Route
              path="/workspaces/:id"
              element={<WorkspaceDetailPage />}
            />
            <Route path="/capacity" element={<CapacityPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </ErrorBoundary>
      </AppShell>
    </ProtectedRoute>
  );
}
