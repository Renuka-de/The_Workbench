import { useEffect, useState } from 'react';
import { approveTimesheet, getPendingTimesheets, rejectTimesheet } from '../../services/api';

export function ProjectManagerTimesheetsPage() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getPendingTimesheets();
      setTimesheets(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleApprove = async (timesheetId: string) => {
    try {
      await approveTimesheet(timesheetId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve timesheet');
    }
  };

  const handleReject = async (timesheetId: string) => {
    try {
      const reason = window.prompt('Enter a rejection reason');
      if (!reason || !reason.trim()) {
        return;
      }
      await rejectTimesheet(timesheetId, reason);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject timesheet');
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading pending timesheets…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Pending Timesheets</h2>
        <p className="mt-2 text-sm text-slate-600">Review submitted contractor time and approve or reject it.</p>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-4">
        {timesheets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">No timesheets waiting for approval.</div>
        ) : (
          timesheets.map((sheet) => (
            <div key={sheet.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{sheet.project?.name ?? 'Project'}</p>
                  <p className="text-sm text-slate-600">Contractor: {sheet.contractor?.name ?? 'Unknown'} · {sheet.description}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>{sheet.workDate}</span>
                    <span>{sheet.hours} hours</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleApprove(sheet.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">Approve</button>
                  <button onClick={() => handleReject(sheet.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Reject</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
