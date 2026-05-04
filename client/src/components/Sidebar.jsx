import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  Home,
  LayoutDashboard,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext.jsx';
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

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const visibleGroups = navGroups.filter((group) =>
    group.roles.includes(user?.role)
  );

  return (
    <>
      <div
        className={`no-print fixed inset-0 z-30 bg-ink-900/35 transition lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-ink-100 bg-white transition duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
          <NavLink to="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white">
              M
            </div>
            <div>
              <p className="text-base font-semibold text-ink-900">{appName}</p>
              <p className="text-xs font-medium text-ink-500">Field Service CRM</p>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {visibleGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {group.label}
              </p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
