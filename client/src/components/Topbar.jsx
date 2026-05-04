import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext.jsx';

const routeMeta = [
  {
    pattern: '/admin/dashboard',
    title: 'Dashboard',
    description: 'Monitor maintenance operations, workload, and service performance.'
  },
  {
    pattern: '/admin/clients',
    title: 'Clients',
    description: 'Manage client contacts and maintenance portfolios.'
  },
  {
    pattern: '/admin/properties',
    title: 'Properties',
    description: 'Manage client sites, addresses, and access details.'
  },
  {
    pattern: '/admin/jobs/new',
    title: 'Create job',
    description: 'Create a work order and assign it to a site.'
  },
  {
    pattern: '/admin/jobs',
    title: 'Jobs',
    description: 'Create, assign, filter, and update work orders.'
  },
  {
    pattern: '/admin/schedule',
    title: 'Schedule',
    description: 'Review scheduled work by date, status, and operative.'
  },
  {
    pattern: '/admin/variations',
    title: 'Variations',
    description: 'Review extra work requests and client approvals.'
  },
  {
    pattern: '/operative/dashboard',
    title: 'Assigned work',
    description: 'Track your active jobs, due dates, notes, and photos.'
  },
  {
    pattern: '/operative/jobs/:id',
    title: 'Job detail',
    description: 'Update progress, notes, photos, and variations.'
  },
  {
    pattern: '/operative/jobs',
    title: 'My jobs',
    description: 'Review assigned work orders and field activity.'
  },
  {
    pattern: '/client/dashboard',
    title: 'Client dashboard',
    description: 'Track maintenance activity and variation approvals.'
  },
  {
    pattern: '/client/properties',
    title: 'Properties',
    description: 'View properties linked to your client account.'
  },
  {
    pattern: '/client/jobs/:id',
    title: 'Job detail',
    description: 'View notes, photos, variations, and reports.'
  },
  {
    pattern: '/client/jobs',
    title: 'Jobs',
    description: 'Track maintenance work across your properties.'
  },
  {
    pattern: '/client/variations',
    title: 'Variations',
    description: 'Review priced extra work requests.'
  },
  {
    pattern: '/reports/jobs/:jobId',
    title: 'Job report',
    description: 'Print-ready job notes, photos, and completion details.'
  }
];

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout, user } = useAuth();
  const page = routeMeta.find((item) =>
    matchPath({ path: item.pattern, end: true }, location.pathname)
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="no-print sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-ink-100 bg-white px-4 py-3 sm:px-6 lg:min-h-[92px] lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
          aria-label="Toggle navigation"
        >
          <Menu className="h-7 w-7 lg:h-6 lg:w-6" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold leading-7 text-ink-900 lg:text-2xl">
            {page?.title || 'Workspace'}
          </p>
          <p className="hidden truncate text-sm leading-6 text-ink-500 sm:block">
            {page?.description || `${user?.role || 'Maintenix'} workspace`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div
          className="relative hidden h-11 w-11 items-center justify-center rounded-full bg-white text-ink-600 sm:flex"
          aria-label="Notifications indicator"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-1.5 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-white">
            0
          </span>
        </div>
        <div className="relative border-l border-ink-100 pl-3 sm:pl-5">
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="flex items-center gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-ink-50"
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-semibold text-brand-700 ring-1 ring-ink-100">
              {user?.name?.charAt(0) || 'M'}
            </div>
            <div className="hidden min-w-28 sm:block">
              <p className="text-sm font-semibold text-ink-900">
                {user?.name || 'Maintenix User'}
              </p>
              <p className="text-xs capitalize text-ink-500">
                {user?.role || 'workspace'}
              </p>
            </div>
            <ChevronDown className="hidden h-5 w-5 text-ink-500 sm:block" aria-hidden="true" />
          </button>
          {isProfileOpen ? (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-ink-100 bg-white p-2 shadow-soft"
              role="menu"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
