import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  CircleHelp,
  Home,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext.jsx';
import { getDashboardPathForRole } from '../auth/roleRoutes.js';
import { appName } from '../utils/constants.js';

const navGroups = [
  {
    label: 'Admin',
    roles: ['admin'],
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Clients', to: '/admin/clients', icon: Users },
      { label: 'Properties', to: '/admin/properties', icon: Building2 },
      { label: 'Jobs', to: '/admin/jobs', icon: ClipboardList },
      { label: 'Schedule', to: '/admin/schedule', icon: CalendarDays },
      { label: 'Variations', to: '/admin/variations', icon: BriefcaseBusiness }
    ]
  },
  {
    label: 'Field',
    roles: ['operative'],
    items: [
      { label: 'Dashboard', to: '/operative/dashboard', icon: LayoutDashboard },
      { label: 'My Jobs', to: '/operative/jobs', icon: Wrench }
    ]
  },
  {
    label: 'Client',
    roles: ['client'],
    items: [
      { label: 'Portal', to: '/client/dashboard', icon: Home },
      { label: 'Properties', to: '/client/properties', icon: Building2 },
      { label: 'Jobs', to: '/client/jobs', icon: ClipboardList },
      { label: 'Variations', to: '/client/variations', icon: BriefcaseBusiness }
    ]
  }
];

const MaintenixMark = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="maintenix-mark-a" x1="5" y1="6" x2="43" y2="42">
        <stop stopColor="#41B6FF" />
        <stop offset="0.45" stopColor="#1D7FF0" />
        <stop offset="1" stopColor="#1557D6" />
      </linearGradient>
      <linearGradient id="maintenix-mark-b" x1="16" y1="9" x2="34" y2="35">
        <stop stopColor="#7DD3FF" />
        <stop offset="1" stopColor="#2F80ED" />
      </linearGradient>
    </defs>
    <path
      d="M5 38V10c0-2.2 2.6-3.4 4.3-2l14.3 11.5L38 8c1.7-1.4 4.3-.2 4.3 2v28h-9.4V22.2L23.6 30 14.3 22.2V38H5Z"
      fill="url(#maintenix-mark-a)"
    />
    <path
      d="M14.3 8.8 23.6 16l9.3-7.2V38h-8.4V25.8l-.9.8-.9-.8V38h-8.4V8.8Z"
      fill="url(#maintenix-mark-b)"
      opacity="0.92"
    />
  </svg>
);

const Sidebar = ({ isCollapsed = false, isOpen, onClose }) => {
  const { user } = useAuth();
  const visibleGroups = navGroups.filter((group) =>
    group.roles.includes(user?.role)
  );
  const dashboardPath = getDashboardPathForRole(user?.role);

  return (
    <>
      <div
        className={`no-print fixed inset-0 z-30 bg-navy-950/60 transition lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex h-screen w-72 transform flex-col overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white shadow-nav transition-all duration-200 lg:sticky lg:inset-auto lg:top-0 lg:shrink-0 lg:translate-x-0 ${
          isCollapsed ? 'lg:w-24' : 'lg:w-72'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[96px] shrink-0 items-center justify-between px-5">
          <NavLink
            to={dashboardPath}
            onClick={onClose}
            className={`flex min-w-0 items-center gap-3 ${
              isCollapsed ? 'lg:justify-center' : ''
            }`}
          >
            <MaintenixMark className="h-12 w-12 shrink-0 drop-shadow-[0_10px_18px_rgba(29,111,232,0.25)]" />
            <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-lg font-semibold text-white">
                {appName}
              </p>
              <p className="truncate text-xs font-medium text-white/60">
                Property Maintenance
              </p>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {visibleGroups.map((group) => (
            <div key={group.label} className="mb-7">
              <p className={`px-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 ${
                isCollapsed ? 'lg:text-center lg:text-[0]' : ''
              }`}>
                {group.label}
              </p>
              <div className="mt-3 space-y-1.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                        isCollapsed ? 'lg:justify-center lg:px-0' : ''
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-900/30'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className={isCollapsed ? 'lg:hidden' : ''}>
                      {item.label}
                    </span>
                  </NavLink>
                ))}
                {user?.role === 'admin' ? (
                  <div
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/35 ${
                      isCollapsed ? 'lg:justify-center lg:px-0' : ''
                    }`}
                    aria-disabled="true"
                    title="Reports are available from individual jobs"
                  >
                    <BarChart3 className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className={isCollapsed ? 'lg:hidden' : ''}>
                      Reports
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </nav>

        <div className={`shrink-0 border-t border-white/15 px-4 pb-4 pt-5 ${
          isCollapsed ? 'lg:hidden' : ''
        }`}>
          <div className="grid gap-1.5">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70">
              <Settings className="h-5 w-5" aria-hidden="true" />
              Settings
            </div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70">
              <CircleHelp className="h-5 w-5" aria-hidden="true" />
              Help & Support
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  Maintenix CRM
                </p>
                <p className="text-xs capitalize text-emerald-300">
                  {user?.role || 'workspace'} access
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
