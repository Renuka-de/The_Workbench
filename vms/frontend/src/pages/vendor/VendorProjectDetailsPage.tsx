import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createVendorAssignment, getVendorContractors, getVendorProject } from '../../services/vendor';
import type { Contractor, ProjectDetails } from '../../types/vendor';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function VendorProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [projectPayload, contractorPayload] = await Promise.all([
          getVendorProject(Number(id)),
          getVendorContractors(),
        ]);

        if (active) {
          setProject(projectPayload);
          setContractors(contractorPayload);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load project');
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
  }, [id]);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading project...</div>;
  }

  if (error || !project) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error ?? 'Project not found.'}</div>;
  }

  const assignedContractorIds = new Set(project.assignments.map((assignment) => assignment.contractorId));
  const availableContractors = contractors.filter((contractor) => !assignedContractorIds.has(contractor.id));

  const handleAddAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedContractorId) {
      return;
    }

    setSavingAssignment(true);
    setError(null);

    try {
      await createVendorAssignment(project.id, Number(selectedContractorId));
      const refreshedProject = await getVendorProject(project.id);
      setProject(refreshedProject);
      setSelectedContractorId('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to add assignment');
    } finally {
      setSavingAssignment(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">{project.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{project.department} · {project.status.replaceAll('_', ' ')}</p>
        </div>
        <Link
          to={`/vendor/projects/${project.id}/edit`}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Edit Project
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Overview</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-slate-500">Description</dt><dd className="mt-1 text-slate-800">{project.description}</dd></div>
            <div><dt className="text-slate-500">Dates</dt><dd className="mt-1 text-slate-800">{formatDate(project.startDate)} to {formatDate(project.endDate)}</dd></div>
            <div><dt className="text-slate-500">Billing</dt><dd className="mt-1 text-slate-800">{project.billingType} {project.hourlyRate ? `· ${project.currency} ${project.hourlyRate}/hr` : ''}</dd></div>
            <div><dt className="text-slate-500">Contract type</dt><dd className="mt-1 text-slate-800">{project.contractType}</dd></div>
            <div><dt className="text-slate-500">Skills</dt><dd className="mt-1 text-slate-800">{project.requiredSkills.join(', ') || 'None'}</dd></div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Assignments</h3>
          <form onSubmit={handleAddAssignment} className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <label className="block text-sm font-medium text-slate-700">Add contract worker</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedContractorId}
                onChange={(event) => setSelectedContractorId(event.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              >
                <option value="">Select contractor</option>
                {availableContractors.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name} · {contractor.availability}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={savingAssignment || !selectedContractorId}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
              >
                {savingAssignment ? 'Adding...' : 'Add Assignment'}
              </button>
            </div>
            {availableContractors.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">All listed contract workers are already assigned to this project.</p>
            ) : null}
          </form>

          {project.assignments.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No assignments yet for this project.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {project.assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="font-medium text-slate-900">{assignment.contractorName}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {assignment.status} · {formatDate(assignment.assignedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
