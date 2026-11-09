import { ArrowRight, Loader2, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext.jsx';
import { getDashboardPathForRole } from '../../auth/roleRoutes.js';

const demoAccounts = [
  { role: 'Admin', email: 'admin@maintenix.com', password: 'Password123' },
  {
    role: 'Operative',
    email: 'operative@maintenix.com',
    password: 'Password123'
  },
  { role: 'Client', email: 'client@maintenix.com', password: 'Password123' }
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: 'admin@maintenix.com',
    password: 'Password123'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardPathForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(formData);
      const fromPath = location.state?.from?.pathname;
      const nextPath = fromPath || getDashboardPathForRole(loggedInUser.role);

      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to sign in. Check your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (account) => {
    setFormData({
      email: account.email,
      password: account.password
    });
    setError('');
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-700 text-white">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-normal text-ink-900">
          Sign in to Maintenix
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Use one of the demo accounts to access a role-specific workspace.
        </p>
      </div>

      <form className="panel p-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email address
            </label>
            <input
              className="input mt-1"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@maintenix.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              className="input mt-1"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password123"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-ink-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        {demoAccounts.map((account) => (
          <button
            type="button"
            key={account.email}
            onClick={() => fillDemoAccount(account)}
            className="flex items-center justify-between rounded-lg border border-ink-100 bg-white px-4 py-3 text-left text-sm transition hover:border-brand-500 hover:bg-brand-50"
          >
            <span className="font-medium text-ink-900">{account.role}</span>
            <span className="text-ink-500">{account.email}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
