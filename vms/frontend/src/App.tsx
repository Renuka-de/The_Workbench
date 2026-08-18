import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { ContractorDashboardPage } from './pages/contractor/ContractorDashboardPage';
import { ContractorAssignmentsPage } from './pages/contractor/ContractorAssignmentsPage';
import { ContractorProjectsPage } from './pages/contractor/ContractorProjectsPage';
import { ContractorProjectDetailPage } from './pages/contractor/ContractorProjectDetailPage';
import { ContractorTimesheetsPage } from './pages/contractor/ContractorTimesheetsPage';
import { ProjectManagerDashboardPage } from './pages/project-manager/ProjectManagerDashboardPage';
import { ProjectManagerProjectDetailPage } from './pages/project-manager/ProjectManagerProjectDetailPage';
import { ProjectManagerTimesheetsPage } from './pages/project-manager/ProjectManagerTimesheetsPage';
import { ProtectedRoute } from './router/ProtectedRoute';

const queryClient = new QueryClient();

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-600">You do not have permission to access this page.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route element={<AppLayout />}>
              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute role="VENDOR">
                    <VendorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractor/dashboard"
                element={
                  <ProtectedRoute role="CONTRACTOR">
                    <ContractorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractor/assignments"
                element={
                  <ProtectedRoute role="CONTRACTOR">
                    <ContractorAssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractor/projects"
                element={
                  <ProtectedRoute role="CONTRACTOR">
                    <ContractorProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractor/projects/:projectId"
                element={
                  <ProtectedRoute role="CONTRACTOR">
                    <ContractorProjectDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractor/projects/:projectId/timesheets"
                element={
                  <ProtectedRoute role="CONTRACTOR">
                    <ContractorTimesheetsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractor/timesheets"
                element={
                  <ProtectedRoute role="CONTRACTOR">
                    <ContractorTimesheetsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project-manager/dashboard"
                element={
                  <ProtectedRoute role="PROJECT_MANAGER">
                    <ProjectManagerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project-manager/projects/:projectId"
                element={
                  <ProtectedRoute role="PROJECT_MANAGER">
                    <ProjectManagerProjectDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project-manager/timesheets"
                element={
                  <ProtectedRoute role="PROJECT_MANAGER">
                    <ProjectManagerTimesheetsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
