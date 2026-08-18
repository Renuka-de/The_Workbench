export function ContractorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Contractor Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Active Projects', value: '0' },
          { label: 'Pending Assignments', value: '0' },
          { label: 'Timesheets', value: '0' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
