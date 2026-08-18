import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorDashboard } from '../../services/vendor';
import type { DashboardStats } from '../../types/vendor';

function StatCard(props: { label: string; value: number; delta: number }) {
  const isPositive = props.delta >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{props.label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{props.value}</p>
      <p className={`mt-2 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? '+' : ''}
        {props.delta}% from last week
      </p>
    </div>
  );
}

export function VendorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await getVendorDashboard();
        if (active) {
          setStats(payload);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading dashboard...</div>;
  }

  if (error || !stats) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error ?? 'Dashboard is unavailable right now.'}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Vendor Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Your outside vendor workspace is now available inside VMS.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Projects" value={stats.activeProjects} delta={stats.activeProjectsDelta} />
        <StatCard label="Contractors" value={stats.contractors} delta={stats.contractorsDelta} />
        <StatCard label="Pending Actions" value={stats.pendingActions} delta={stats.pendingActionsDelta} />
        <StatCard label="Invoices" value={stats.invoices} delta={stats.invoicesDelta} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Projects</h3>
            <p className="text-sm text-slate-500">Latest vendor-side projects moved into the VMS area.</p>
          </div>

          <Link
            to="/vendor/projects"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.recentProjects.map((project) => (
            <div key={project.id} className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-slate-900">{project.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {project.department} · {project.numberOfContractors} contractor slots
                </p>
              </div>
              <div className="text-sm text-slate-500">{new Date(project.startDate).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
