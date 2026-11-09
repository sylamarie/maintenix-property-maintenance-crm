import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import RoleRoute from './auth/RoleRoute.jsx';
import { getDashboardPathForRole } from './auth/roleRoutes.js';
import PageLoader from './components/ui/PageLoader.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// Pages are loaded on demand: a visitor only downloads the code for the
// screens they actually open (for example, a client never downloads the
// admin pages).
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminClientsPage = lazy(() => import('./pages/admin/AdminClientsPage.jsx'));
const AdminJobFormPage = lazy(() => import('./pages/admin/AdminJobFormPage.jsx'));
const AdminJobsPage = lazy(() => import('./pages/admin/AdminJobsPage.jsx'));
const AdminPropertiesPage = lazy(() => import('./pages/admin/AdminPropertiesPage.jsx'));
const AdminSchedulePage = lazy(() => import('./pages/admin/AdminSchedulePage.jsx'));
const AdminVariationsPage = lazy(() => import('./pages/admin/AdminVariationsPage.jsx'));
const ClientDashboardPage = lazy(() => import('./pages/client/ClientDashboardPage.jsx'));
const ClientJobDetailPage = lazy(() => import('./pages/client/ClientJobDetailPage.jsx'));
const ClientJobsPage = lazy(() => import('./pages/client/ClientJobsPage.jsx'));
const ClientPropertiesPage = lazy(() => import('./pages/client/ClientPropertiesPage.jsx'));
const ClientVariationsPage = lazy(() => import('./pages/client/ClientVariationsPage.jsx'));
const OperativeDashboardPage = lazy(
  () => import('./pages/operative/OperativeDashboardPage.jsx')
);
const OperativeJobDetailPage = lazy(
  () => import('./pages/operative/OperativeJobDetailPage.jsx')
);
const OperativeJobsPage = lazy(() => import('./pages/operative/OperativeJobsPage.jsx'));
const JobReportPage = lazy(() => import('./pages/shared/JobReportPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage.jsx'));

const DashboardRedirect = () => {
  const { user } = useAuth();

  return <Navigate to={getDashboardPathForRole(user?.role)} replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardRedirect />} />
              <Route path="/reports/jobs/:jobId" element={<JobReportPage />} />

              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/clients" element={<AdminClientsPage />} />
                <Route path="/admin/properties" element={<AdminPropertiesPage />} />
                <Route path="/admin/jobs" element={<AdminJobsPage />} />
                <Route path="/admin/jobs/new" element={<AdminJobFormPage />} />
                <Route path="/admin/schedule" element={<AdminSchedulePage />} />
                <Route path="/admin/variations" element={<AdminVariationsPage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['operative']} />}>
                <Route
                  path="/operative/dashboard"
                  element={<OperativeDashboardPage />}
                />
                <Route path="/operative/jobs" element={<OperativeJobsPage />} />
                <Route path="/operative/jobs/:id" element={<OperativeJobDetailPage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['client']} />}>
                <Route path="/client/dashboard" element={<ClientDashboardPage />} />
                <Route path="/client/properties" element={<ClientPropertiesPage />} />
                <Route path="/client/jobs" element={<ClientJobsPage />} />
                <Route path="/client/jobs/:id" element={<ClientJobDetailPage />} />
                <Route path="/client/variations" element={<ClientVariationsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default App;
