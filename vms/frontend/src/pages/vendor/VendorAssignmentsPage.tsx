import { useEffect, useState } from 'react';
import { createVendorAssignment, getVendorAssignments, getVendorContractors, getVendorProjects } from '../../services/vendor';
import type { Assignment, Contractor, Project } from '../../types/vendor';

export function VendorAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [projectId, setProjectId] = useState('');
  const [contractorId, setContractorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextAssignments, nextProjects, nextContractors] = await Promise.all([
        getVendorAssignments(),
        getVendorProjects(),
        getVendorContractors(),
      ]);
      setAssignments(nextAssignments);
      setProjects(nextProjects);
      setContractors(nextContractors);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectId || !contractorId) return;
    setSaving(true);
    setError(null);
    try {
      await createVendorAssignment(Number(projectId), Number(contractorId));
      setProjectId('');
      setContractorId('');
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Assignments</h2>
        <p className="mt-1 text-sm text-slate-500">Assign contractors to vendor projects from inside `vms`.</p>
      </div>

      <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        <select value={contractorId} onChange={(e) => setContractorId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
          <option value="">Select contractor</option>
          {contractors.map((contractor) => (
            <option key={contractor.id} value={contractor.id}>{contractor.name}</option>
          ))}
        </select>
        <button type="submit" disabled={saving || !projectId || !contractorId} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400">
          {saving ? 'Assigning...' : 'Create Assignment'}
        </button>
      </form>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No assignments yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Contractor</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((assignment) => {
                  const project = projects.find((item) => item.id === assignment.projectId);
                  return (
                    <tr key={assignment.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">{assignment.contractorName}</td>
                      <td className="px-4 py-4 text-slate-700">{project?.name ?? `Project #${assignment.projectId}`}</td>
                      <td className="px-4 py-4 text-slate-700">{assignment.status}</td>
                      <td className="px-4 py-4 text-slate-500">{new Date(assignment.assignedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
