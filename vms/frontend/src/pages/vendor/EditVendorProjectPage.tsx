import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVendorProject, updateVendorProject } from '../../services/vendor';
import type { BillingType, ContractType, ProjectStatus, UpdateProjectInput } from '../../types/vendor';

export function EditVendorProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<UpdateProjectInput | null>(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const project = await getVendorProject(Number(id));
        if (active) {
          setForm({
            name: project.name,
            description: project.description,
            department: project.department,
            startDate: project.startDate,
            endDate: project.endDate,
            billingType: project.billingType,
            hourlyRate: project.hourlyRate,
            currency: project.currency,
            contractType: project.contractType,
            requiredSkills: project.requiredSkills,
            minimumExperience: project.minimumExperience,
            numberOfContractors: project.numberOfContractors,
            status: project.status,
          });
          setSkillsInput(project.requiredSkills.join(', '));
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

  const updateField = <K extends keyof UpdateProjectInput>(key: K, value: UpdateProjectInput[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);

    try {
      await updateVendorProject(Number(id), {
        ...form,
        hourlyRate: form.billingType === 'HOURLY' ? Number(form.hourlyRate ?? 0) : null,
        minimumExperience: Number(form.minimumExperience ?? 0),
        numberOfContractors: Number(form.numberOfContractors ?? 1),
        requiredSkills: skillsInput.split(',').map((item) => item.trim()).filter(Boolean),
      });
      navigate(`/vendor/projects/${id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading project...</div>;
  }

  if (error && !form) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>;
  }

  if (!form) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">Project not found.</div>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Edit Project</h2>
        <p className="mt-1 text-sm text-slate-500">Update project details without leaving the VMS vendor area.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <input required value={form.name ?? ''} onChange={(e) => updateField('name', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <input required value={form.department ?? ''} onChange={(e) => updateField('department', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <textarea required rows={4} value={form.description ?? ''} onChange={(e) => updateField('description', e.target.value)} className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <input required type="date" value={form.startDate ?? ''} onChange={(e) => updateField('startDate', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <input required type="date" value={form.endDate ?? ''} onChange={(e) => updateField('endDate', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <select value={form.billingType ?? 'HOURLY'} onChange={(e) => updateField('billingType', e.target.value as BillingType)} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400">
            <option value="HOURLY">Hourly</option>
            <option value="FIXED">Fixed</option>
            <option value="MILESTONE">Milestone</option>
          </select>
          <select value={form.contractType ?? 'CONTRACTOR'} onChange={(e) => updateField('contractType', e.target.value as ContractType)} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400">
            <option value="CONTRACTOR">Contractor</option>
            <option value="TEMPORARY">Temporary</option>
            <option value="CONSULTANT">Consultant</option>
          </select>
          <input value={form.currency ?? 'USD'} onChange={(e) => updateField('currency', e.target.value.toUpperCase())} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <input type="number" min="0" step="0.01" value={form.hourlyRate ?? 0} onChange={(e) => updateField('hourlyRate', Number(e.target.value))} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <input type="number" min="0" value={form.minimumExperience ?? 0} onChange={(e) => updateField('minimumExperience', Number(e.target.value))} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <input type="number" min="1" value={form.numberOfContractors ?? 1} onChange={(e) => updateField('numberOfContractors', Number(e.target.value))} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
          <select value={form.status ?? 'DRAFT'} onChange={(e) => updateField('status', e.target.value as ProjectStatus)} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400">
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
          </select>
          <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
