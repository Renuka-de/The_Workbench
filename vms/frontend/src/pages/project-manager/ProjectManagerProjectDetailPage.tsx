import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProject } from '../../services/api';

export function ProjectManagerProjectDetailPage() {
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
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">{project.name}</h2>
        <p className="mt-2 text-sm text-slate-600">{project.description}</p>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Vendor</p>
          <p className="mt-2 font-medium">{project.vendor?.name ?? 'N/A'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-2 font-medium">{project.status}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Dates</p>
          <p className="mt-2 font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'} to {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Assigned Contractors</h3>
        <div className="mt-4 space-y-3">
          {project.assignments?.length ? (
            project.assignments.map((assignment: any) => (
              <div key={assignment.contractor.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-medium text-slate-900">{assignment.contractor.name}</p>
                  <p className="text-sm text-slate-600">Status: {assignment.status}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p>Total submitted: {assignment.totalSubmittedHours ?? 0}h</p>
                  <p>Approved: {assignment.approvedHours ?? 0}h</p>
                  <p>Pending: {assignment.pendingTimesheets ?? 0}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No assigned contractors yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
