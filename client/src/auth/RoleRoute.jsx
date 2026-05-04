import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './AuthContext.jsx';
import { getDashboardPathForRole } from './roleRoutes.js';
import PageLoader from '../components/ui/PageLoader.jsx';

const RoleRoute = ({ allowedRoles }) => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPathForRole(user?.role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
