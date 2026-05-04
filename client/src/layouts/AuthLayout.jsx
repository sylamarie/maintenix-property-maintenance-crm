import { Outlet } from 'react-router-dom';

import { appName } from '../utils/constants.js';

const AuthLayout = () => {
  return (
    <main className="grid min-h-screen bg-ink-50 lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
        <Outlet />
      </section>
      <section className="hidden border-l border-ink-100 bg-white p-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-700 text-base font-bold text-white">
            M
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-normal text-ink-900">
            {appName} brings office teams, field operatives, and clients into one
            operational workspace.
          </h1>
        </div>
        <div className="grid gap-4">
          {['Work orders', 'Photo reports', 'Variation approvals'].map((item) => (
            <div key={item} className="rounded-lg border border-ink-100 p-4">
              <p className="text-sm font-semibold text-ink-900">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
