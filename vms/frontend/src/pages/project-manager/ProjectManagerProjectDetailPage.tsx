import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProject } from '../../services/api';
import { listMilestones, createMilestone, approveMilestone, type Milestone } from '../../services/milestone';

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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Milestones</h3>
        <div className="mt-4">
          <MilestonesSection projectId={projectId!} />
        </div>
      </div>
    </div>
  );
}

function MilestonesSection({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await listMilestones(projectId);
      setMilestones(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createMilestone(projectId, { name, description, amount, dueDate: dueDate || undefined });
      setName('');
      setDescription('');
      setAmount(0);
      setDueDate('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create milestone');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    setError('');
    try {
      await approveMilestone(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve milestone');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-4">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Milestone name" className="rounded-lg border border-slate-200 px-3 py-2" />
        <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} type="number" min={0} step="0.01" placeholder="Amount" className="rounded-lg border border-slate-200 px-3 py-2" />
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className="rounded-lg border border-slate-200 px-3 py-2" />
        <button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">{saving ? 'Saving...' : 'Create'}</button>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="md:col-span-4 rounded-lg border border-slate-200 px-3 py-2" />
      </form>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div>
        {loading ? (
          <div className="text-slate-500">Loading milestones…</div>
        ) : milestones.length === 0 ? (
          <div className="text-slate-500">No milestones yet.</div>
        ) : (
          <div className="space-y-3">
            {milestones.map((m) => (
              <div key={m.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-sm text-slate-600">{m.description ?? ''}</p>
                    <p className="mt-2 text-sm text-slate-600">Amount: {m.amount} · Due: {m.dueDate ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">{m.status}</div>
                    {m.status === 'COMPLETED' ? (
                      <button onClick={() => handleApprove(m.id)} className="mt-2 rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white">Approve</button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
