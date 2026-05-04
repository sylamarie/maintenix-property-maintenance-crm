import { Link } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext.jsx';
import { getDashboardPathForRole } from '../../auth/roleRoutes.js';

const NotFoundPage = () => {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <div className="panel max-w-xl p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          The requested page does not exist.
        </p>
        <Link
          to={getDashboardPathForRole(user?.role)}
          className="mt-5 inline-flex rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
