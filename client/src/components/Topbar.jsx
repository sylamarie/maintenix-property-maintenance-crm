import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext.jsx';

const Topbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-md p-2 text-ink-600 hover:bg-ink-50 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="hidden w-80 items-center gap-2 rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-500 md:flex">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span>Search jobs, clients, properties</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md p-2 text-ink-500 hover:bg-ink-50"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-3 rounded-md border border-ink-100 bg-white px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {user?.name?.charAt(0) || 'M'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="text-xs capitalize text-ink-500">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
