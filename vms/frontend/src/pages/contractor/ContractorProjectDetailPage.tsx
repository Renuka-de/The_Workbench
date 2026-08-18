import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProject } from '../../services/api';

export function ContractorProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load project');
      }
    };

    void load();
  }, [projectId]);

  if (!project) {
    return <div className="text-slate-500">Loading project…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">{project.name}</h2>
          <p className="mt-2 text-sm text-slate-600">{project.description}</p>
        </div>
        <Link to={`/contractor/projects/${project.id}/timesheets`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Submit Timesheet
        </Link>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Vendor</p>
          <p className="mt-2 font-medium">{project.vendor?.name ?? 'N/A'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Project Manager</p>
          <p className="mt-2 font-medium">{project.projectManager?.name ?? 'N/A'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Dates</p>
          <p className="mt-2 font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'} to {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}</p>
        </div>
      </div>
    </div>
  );
}
