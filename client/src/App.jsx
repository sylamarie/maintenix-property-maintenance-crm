import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import RoleRoute from './auth/RoleRoute.jsx';
import { getDashboardPathForRole } from './auth/roleRoutes.js';
import AppLayout from './layouts/AppLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminClientsPage from './pages/admin/AdminClientsPage.jsx';
import AdminJobFormPage from './pages/admin/AdminJobFormPage.jsx';
import AdminJobsPage from './pages/admin/AdminJobsPage.jsx';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage.jsx';
import AdminSchedulePage from './pages/admin/AdminSchedulePage.jsx';
import AdminVariationsPage from './pages/admin/AdminVariationsPage.jsx';
import ClientDashboardPage from './pages/client/ClientDashboardPage.jsx';
import ClientJobDetailPage from './pages/client/ClientJobDetailPage.jsx';
import ClientJobsPage from './pages/client/ClientJobsPage.jsx';
import ClientPropertiesPage from './pages/client/ClientPropertiesPage.jsx';
import ClientVariationsPage from './pages/client/ClientVariationsPage.jsx';
import OperativeDashboardPage from './pages/operative/OperativeDashboardPage.jsx';
import OperativeJobDetailPage from './pages/operative/OperativeJobDetailPage.jsx';
import OperativeJobsPage from './pages/operative/OperativeJobsPage.jsx';
import JobReportPage from './pages/shared/JobReportPage.jsx';
import NotFoundPage from './pages/shared/NotFoundPage.jsx';
import { useAuth } from './auth/AuthContext.jsx';

const DashboardRedirect = () => {
  const { user } = useAuth();

  return <Navigate to={getDashboardPathForRole(user?.role)} replace />;
};

const App = () => {
  return (
    <AuthProvider>
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
              <Route
                path="/admin/properties"
                element={<AdminPropertiesPage />}
              />
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
              <Route path="/admin/jobs/new" element={<AdminJobFormPage />} />
              <Route path="/admin/schedule" element={<AdminSchedulePage />} />
              <Route
                path="/admin/variations"
                element={<AdminVariationsPage />}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={['operative']} />}>
              <Route
                path="/operative/dashboard"
                element={<OperativeDashboardPage />}
              />
              <Route
                path="/operative/jobs"
                element={<OperativeJobsPage />}
              />
              <Route
                path="/operative/jobs/:id"
                element={<OperativeJobDetailPage />}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={['client']} />}>
              <Route path="/client/dashboard" element={<ClientDashboardPage />} />
              <Route
                path="/client/properties"
                element={<ClientPropertiesPage />}
              />
              <Route
                path="/client/jobs"
                element={<ClientJobsPage />}
              />
              <Route
                path="/client/jobs/:id"
                element={<ClientJobDetailPage />}
              />
              <Route
                path="/client/variations"
                element={<ClientVariationsPage />}
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
