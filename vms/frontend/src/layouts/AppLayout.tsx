import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types/auth';

const navByRole: Record<Role, { label: string; to: string }[]> = {
  VENDOR: [
    { label: 'Dashboard', to: '/vendor/dashboard' },
    { label: 'Projects', to: '/vendor/projects' },
    { label: 'Assignments', to: '/vendor/assignments' },
  ],
  CONTRACTOR: [
    { label: 'Dashboard', to: '/contractor/dashboard' },
    { label: 'Assignments', to: '/contractor/assignments' },
    { label: 'My Projects', to: '/contractor/projects' },
    { label: 'Timesheets', to: '/contractor/timesheets' },
    { label: 'Profile', to: '/contractor/profile' },
  ],
  PROJECT_MANAGER: [
    { label: 'Dashboard', to: '/project-manager/dashboard' },
    { label: 'Timesheets', to: '/project-manager/timesheets' },
    { label: 'Profile', to: '/project-manager/profile' },
  ],
};

export function AppLayout() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const items = navByRole[user.role];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white p-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">VMS</p>
            <h1 className="mt-2 text-2xl font-semibold">Vendor Portal</h1>
          </div>

          <nav className="space-y-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-8 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <header className="mb-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Logged in as</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {user.role}
            </span>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
