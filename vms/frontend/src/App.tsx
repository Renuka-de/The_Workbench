import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CreateVendorProjectPage } from './pages/vendor/CreateVendorProjectPage';
import { EditVendorProjectPage } from './pages/vendor/EditVendorProjectPage';
import { VendorAssignmentsPage } from './pages/vendor/VendorAssignmentsPage';
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { VendorProjectDetailsPage } from './pages/vendor/VendorProjectDetailsPage';
import { VendorProjectsPage } from './pages/vendor/VendorProjectsPage';
import { ContractorDashboardPage } from './pages/contractor/ContractorDashboardPage';
import { ProjectManagerDashboardPage } from './pages/project-manager/ProjectManagerDashboardPage';
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
                path="/vendor/projects"
                element={
                  <ProtectedRoute role="VENDOR">
                    <VendorProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/projects/create"
                element={
                  <ProtectedRoute role="VENDOR">
                    <CreateVendorProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/projects/:id"
                element={
                  <ProtectedRoute role="VENDOR">
                    <VendorProjectDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/projects/:id/edit"
                element={
                  <ProtectedRoute role="VENDOR">
                    <EditVendorProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/assignments"
                element={
                  <ProtectedRoute role="VENDOR">
                    <VendorAssignmentsPage />
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
                path="/project-manager/dashboard"
                element={
                  <ProtectedRoute role="PROJECT_MANAGER">
                    <ProjectManagerDashboardPage />
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
