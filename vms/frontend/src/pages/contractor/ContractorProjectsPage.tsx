import { useEffect, useState } from 'react';
import { getProjects } from '../../services/api';

export function ContractorProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading projects…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">My Projects</h2>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">No accepted projects yet.</div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">{project.name}</p>
              <p className="mt-1 text-sm text-slate-600">{project.description ?? 'No description'}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">{project.status}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">PM: {project.projectManager?.name ?? 'N/A'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
