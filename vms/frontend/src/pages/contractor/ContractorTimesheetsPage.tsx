import { useEffect, useState } from 'react';
import { getMyTimesheets, submitTimesheet } from '../../services/api';

export function ContractorTimesheetsPage() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({ projectId: '', workDate: '', hours: '8', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [timesheetsData, projectData] = await Promise.all([getMyTimesheets(), import('../../services/api').then((m) => m.getProjects())]);
        setTimesheets(timesheetsData);
        setProjects(projectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load data');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      await submitTimesheet({
        projectId: form.projectId,
        workDate: form.workDate,
        hours: Number(form.hours),
        description: form.description,
      });
      setForm({ projectId: '', workDate: '', hours: '8', description: '' });
      const nextTimesheets = await getMyTimesheets();
      setTimesheets(nextTimesheets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit timesheet');
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading timesheets…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Timesheets</h2>
        <p className="mt-2 text-sm text-slate-600">Submit daily time for accepted projects.</p>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Project</label>
            <select value={form.projectId} onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" required>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Work date</label>
            <input type="date" value={form.workDate} onChange={(e) => setForm((prev) => ({ ...prev, workDate: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Hours</label>
            <input type="number" min="0.5" max="24" step="0.5" value={form.hours} onChange={(e) => setForm((prev) => ({ ...prev, hours: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Summary</label>
            <input type="text" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
        </div>

        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Submit timesheet</button>
      </form>

      <div className="space-y-4">
        {timesheets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">No timesheets submitted yet.</div>
        ) : (
          timesheets.map((sheet) => (
            <div key={sheet.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{sheet.project?.name ?? 'Project'}</p>
                  <p className="text-sm text-slate-600">{sheet.description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{sheet.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                <span>{sheet.workDate}</span>
                <span>{sheet.hours} hours</span>
                {sheet.rejectionReason ? <span>Reason: {sheet.rejectionReason}</span> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
