import { ArrowRight, Loader2, LockKeyhole } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext.jsx';
import { getDashboardPathForRole } from '../../auth/roleRoutes.js';

const demoAccounts = [
  { role: 'Admin', email: 'admin@maintenix.com' },
  { role: 'Operative', email: 'operative@maintenix.com' },
  { role: 'Client', email: 'client@maintenix.com' }
];

// On your own computer (`npm run dev`) the demo accounts use the public
// password from the README, so the buttons fill it in. On the live website the
// demo password is private and is NOT in this code: `import.meta.env.DEV` is
// replaced by `false` when the site is built, so this string is removed from
// the published JavaScript.
const getLocalDemoPassword = () => (import.meta.env.DEV ? 'Password123' : '');

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login, demoLogin, user } = useAuth();
  const passwordInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: 'admin@maintenix.com',
    password: getLocalDemoPassword()
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Becomes true if the server says one-click demo sign-in is switched off.
  const [isDemoSignInOff, setIsDemoSignInOff] = useState(false);

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
    const localPassword = getLocalDemoPassword();

    setFormData({
      email: account.email,
      password: localPassword
    });
    setError('');

    // Live site: no password is filled in, so put the cursor where it is typed.
    if (!localPassword) {
      passwordInputRef.current?.focus();
    }
  };

  // Clicking a role signs in straight away (no password to type).
  const handleDemoLogin = async (account) => {
    setError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await demoLogin(account.email);
      const fromPath = location.state?.from?.pathname;

      navigate(fromPath || getDashboardPathForRole(loggedInUser.role), { replace: true });
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 403 || status === 404) {
        // This server has demo sign-in switched off: fall back to filling the form.
        setIsDemoSignInOff(true);
        fillDemoAccount(account);
      } else {
        setError(
          requestError.response?.data?.message ||
            'Unable to sign in right now. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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
          Pick a demo role below to explore its workspace, or sign in with your own account.
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
              ref={passwordInputRef}
              value={formData.password}
              onChange={handleChange}
              placeholder={import.meta.env.DEV ? 'Password123' : 'Demo password'}
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
            onClick={() => handleDemoLogin(account)}
            disabled={isSubmitting || isLoading}
            className="flex items-center justify-between rounded-lg border border-ink-100 bg-white px-4 py-3 text-left text-sm transition hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="font-medium text-ink-900">{account.role}</span>
            <span className="text-ink-500">{account.email}</span>
          </button>
        ))}
        {isDemoSignInOff ? (
          import.meta.env.DEV ? null : (
            <p className="text-center text-xs text-ink-500">
              Demo sign-in is switched off here. Enter the demo password you were given.
            </p>
          )
        ) : (
          <p className="text-center text-xs text-ink-500">
            Click a role to sign in instantly.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
