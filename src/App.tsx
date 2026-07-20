import { Routes, Route } from 'react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { MarketingShell } from '@/components/layout/MarketingShell';
import { LandingPage } from '@/components/marketing/LandingPage';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { DashboardPage } from '@/pages/DashboardPage';
import { WorkspacesPage } from '@/pages/WorkspacesPage';
import { WorkspaceDetailPage } from '@/pages/WorkspaceDetailPage';
import { CapacityPage } from '@/pages/CapacityPage';
import { SecurityPage } from '@/pages/SecurityPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AboutPage } from '@/pages/AboutPage';
import { ReportPage } from '@/pages/ReportPage';

export function App() {
  return (
    <Routes>
      {/* Public marketing routes — no auth guard */}
      <Route element={<MarketingShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppShell>
              <ErrorBoundary>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/workspaces" element={<WorkspacesPage />} />
                  <Route
                    path="/workspaces/:id"
                    element={<WorkspaceDetailPage />}
                  />
                  <Route path="/capacity" element={<CapacityPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/report" element={<ReportPage />} />
                </Routes>
              </ErrorBoundary>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
