import { useEffect, useState } from 'react';
import { acceptAssignment, getAssignments, rejectAssignment } from '../../services/api';

export function ContractorAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      setAssignments(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssignments();
  }, []);

  const handleAccept = async (assignmentId: string) => {
    try {
      await acceptAssignment(assignmentId);
      await loadAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to accept assignment');
    }
  };

  const handleReject = async (assignmentId: string) => {
    try {
      await rejectAssignment(assignmentId);
      await loadAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject assignment');
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading assignments…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Assignments</h2>
        <p className="mt-2 text-sm text-slate-600">Review project assignments and accept or reject them.</p>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
            No assignments yet.
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{assignment.project?.name ?? 'Project'}</p>
                  <p className="text-sm text-slate-600">{assignment.project?.description ?? 'No description'}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">Status: {assignment.status}</p>
                </div>

                {assignment.status === 'PENDING' ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(assignment.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">Accept</button>
                    <button onClick={() => handleReject(assignment.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Reject</button>
                  </div>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{assignment.status}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
