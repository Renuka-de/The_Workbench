import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorProjects } from '../../services/vendor';
import type { Project, ProjectStatus } from '../../types/vendor';

const STATUS_OPTIONS: Array<{ label: string; value: '' | ProjectStatus }> = [
  { label: 'All Statuses', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Closed', value: 'CLOSED' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function getStatusTone(status: ProjectStatus) {
  const tones: Record<ProjectStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    OPEN: 'bg-emerald-100 text-emerald-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-violet-100 text-violet-700',
    CLOSED: 'bg-rose-100 text-rose-700',
  };

  return tones[status];
}

export function VendorProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | ProjectStatus>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const nextProjects = await getVendorProjects({ search, status });
        if (active) {
          setProjects(nextProjects);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load projects');
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
  }, [search, status]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Vendor Projects</h2>
          <p className="mt-1 text-sm text-slate-500">Manage open work, staffing needs, and timelines.</p>
        </div>

        <Link
          to="/vendor/projects/create"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create Project
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[2fr_1fr]">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by project name or department"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as '' | ProjectStatus)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading projects...</div>
        ) : error ? (
          <div className="p-6 text-sm text-rose-600">{error}</div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No projects found for the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Dates</th>
                  <th className="px-4 py-3 font-medium">Contractors</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr key={project.id} className="text-slate-700">
                    <td className="px-4 py-4">
                      <Link to={`/vendor/projects/${project.id}`} className="font-medium text-slate-900 hover:underline">{project.name}</Link>
                      <div className="mt-1 text-xs text-slate-500">{project.description}</div>
                    </td>
                    <td className="px-4 py-4">{project.department}</td>
                    <td className="px-4 py-4">
                      <div>{formatDate(project.startDate)}</div>
                      <div className="mt-1 text-xs text-slate-500">to {formatDate(project.endDate)}</div>
                    </td>
                    <td className="px-4 py-4">{project.numberOfContractors}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(project.status)}`}>
                        {project.status.replaceAll('_', ' ')}
                      </span>
                      <div className="mt-2">
                        <Link to={`/vendor/projects/${project.id}/edit`} className="text-xs font-medium text-slate-600 hover:text-slate-900">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
