import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVendorProject } from '../../services/vendor';
import type { BillingType, ContractType, CreateProjectInput } from '../../types/vendor';

const initialForm: CreateProjectInput = {
  name: '',
  description: '',
  department: '',
  startDate: '',
  endDate: '',
  billingType: 'HOURLY',
  hourlyRate: 0,
  currency: 'USD',
  contractType: 'CONTRACTOR',
  requiredSkills: [],
  minimumExperience: 0,
  numberOfContractors: 1,
  status: 'DRAFT',
};

export function CreateVendorProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateProjectInput>(initialForm);
  const [skillsInput, setSkillsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof CreateProjectInput>(key: K, value: CreateProjectInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createVendorProject({
        ...form,
        hourlyRate: form.billingType === 'HOURLY' ? Number(form.hourlyRate ?? 0) : null,
        minimumExperience: Number(form.minimumExperience),
        numberOfContractors: Number(form.numberOfContractors),
        requiredSkills: skillsInput
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      navigate('/vendor/projects');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Create Vendor Project</h2>
        <p className="mt-1 text-sm text-slate-500">Add a project from the outside vendor flow directly inside VMS.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Project name</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Department</span>
            <input
              required
              value={form.department}
              onChange={(event) => updateField('department', event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Description</span>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Start date</span>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(event) => updateField('startDate', event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>End date</span>
            <input
              required
              type="date"
              value={form.endDate}
              onChange={(event) => updateField('endDate', event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Billing type</span>
            <select
              value={form.billingType}
              onChange={(event) => updateField('billingType', event.target.value as BillingType)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            >
              <option value="HOURLY">Hourly</option>
              <option value="FIXED">Fixed</option>
              <option value="MILESTONE">Milestone</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Contract type</span>
            <select
              value={form.contractType}
              onChange={(event) => updateField('contractType', event.target.value as ContractType)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            >
              <option value="CONTRACTOR">Contractor</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="CONSULTANT">Consultant</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Currency</span>
            <input
              required
              value={form.currency}
              onChange={(event) => updateField('currency', event.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 uppercase outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Hourly rate</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.hourlyRate ?? 0}
              onChange={(event) => updateField('hourlyRate', Number(event.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Minimum experience</span>
            <input
              type="number"
              min="0"
              value={form.minimumExperience}
              onChange={(event) => updateField('minimumExperience', Number(event.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Number of contractors</span>
            <input
              type="number"
              min="1"
              value={form.numberOfContractors}
              onChange={(event) => updateField('numberOfContractors', Number(event.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Required skills</span>
            <input
              value={skillsInput}
              onChange={(event) => setSkillsInput(event.target.value)}
              placeholder="React, Node.js, Vendor onboarding"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Saving...' : 'Create Project'}
          </button>
        </div>
      </form>
    </section>
  );
}
