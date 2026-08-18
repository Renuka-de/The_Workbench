import { PrismaClient } from '@prisma/client';
import { createNotification } from './notification.service.js';

const prisma = new PrismaClient();

export const generateInvoiceForProject = async (projectId: string, generatedBy?: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  // fetch approved, unbilled timesheets and approved, unbilled milestones
  const timesheets = await prisma.timesheet.findMany({ where: { projectId, status: 'APPROVED', billed: false } });
  const milestones = await prisma.milestone.findMany({ where: { projectId, status: 'APPROVED', billedAt: null } });

  if (timesheets.length === 0 && milestones.length === 0) {
    throw new Error('No billable items found');
  }

  const items: Array<{ description: string; quantity: number; unitAmount: number; lineAmount: number; type: any; referenceId?: string }> = [];

  // aggregate timesheets by contractor and week
  const byContractorWeek = new Map<string, { hours: number; contractorId: string; weekStart: string }>();
  for (const t of timesheets) {
    const d = new Date(t.workDate);
    // compute week start (Monday)
    const day = d.getUTCDay();
    const diff = (day + 6) % 7; // days since Monday
    const weekStartDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
    const key = `${t.contractorId}:${weekStartDate.toISOString().slice(0,10)}`;
    const curr = byContractorWeek.get(key) ?? { hours: 0, contractorId: t.contractorId, weekStart: weekStartDate.toISOString().slice(0,10) };
    curr.hours += t.hours;
    byContractorWeek.set(key, curr);
  }

  for (const [, v] of byContractorWeek) {
    const unit = Number(project.hourlyRate ?? 0);
    const line = v.hours * unit;
    items.push({ description: `Timesheet hours for ${v.contractorId} week ${v.weekStart}`, quantity: v.hours, unitAmount: unit, lineAmount: line, type: 'TIMESHEET' });
  }

  for (const m of milestones) {
    items.push({ description: `Milestone: ${m.name}`, quantity: 1, unitAmount: m.amount, lineAmount: m.amount, type: 'MILESTONE', referenceId: m.id });
  }

  const calculatedAmount = items.reduce((s, it) => s + it.lineAmount, 0);

  // create invoice inside transaction
  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        projectId,
        vendorId: project.vendorId,
        generatedBy: generatedBy ?? null,
        storedAmount: calculatedAmount,
        calculatedAmount,
      },
    });

    for (const it of items) {
      await tx.invoiceItem.create({
        data: {
          invoiceId: inv.id,
          type: it.type,
          referenceId: it.referenceId ?? null,
          description: it.description,
          quantity: it.quantity,
          unitAmount: it.unitAmount,
          lineAmount: it.lineAmount,
        },
      });
    }

    // mark timesheets billed
    if (timesheets.length) {
      const tsIds = timesheets.map((t) => t.id);
      await tx.timesheet.updateMany({ where: { id: { in: tsIds } }, data: { billed: true, billedAt: new Date() } });
    }

    // mark milestones billed
    if (milestones.length) {
      const msIds = milestones.map((m) => m.id);
      await tx.milestone.updateMany({ where: { id: { in: msIds } }, data: { billedAt: new Date() } });
    }

    return inv;
  });

  // notify vendor and project manager
  try {
    await createNotification(project.vendorId, 'INVOICE_GENERATED', 'EMAIL', { invoiceId: invoice.id });
    await createNotification(project.projectManagerId, 'INVOICE_GENERATED', 'IN_APP', { invoiceId: invoice.id });
  } catch (e) {
    // swallow notification errors
    console.error('notification error', e);
  }

  return invoice;
};

export const validateInvoice = async (invoiceId: string) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { items: true, project: true } });
  if (!invoice) throw new Error('Invoice not found');

  // recompute from items
  const recomputed = (invoice.items ?? []).reduce((s, it) => s + it.lineAmount, 0);
  const status = recomputed === invoice.storedAmount ? 'VALIDATED' : 'EXCEPTION';

  const updated = await prisma.invoice.update({ where: { id: invoiceId }, data: { calculatedAmount: recomputed, status } });

  if (status === 'EXCEPTION') {
    // notify vendor
    try {
      await createNotification(invoice.vendorId, 'VALIDATION_FAILED', 'EMAIL', { invoiceId });
    } catch (e) {
      console.error('notification error', e);
    }
  }

  return updated;
};

export const approveInvoice = async (invoiceId: string, approverId: string, approve: boolean) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { project: true } });
  if (!invoice) throw new Error('Invoice not found');
  if (invoice.project.projectManagerId !== approverId) throw new Error('You do not manage this project');

  const approvalStatus = approve ? 'APPROVED' : 'REJECTED';
  const updated = await prisma.invoice.update({ where: { id: invoiceId }, data: { approvalStatus, approvedAt: approve ? new Date() : null, approvedBy: approve ? approverId : null } });

  // notify vendor
  try {
    await createNotification(invoice.vendorId, approve ? 'INVOICE_APPROVED' : 'INVOICE_REJECTED', 'EMAIL', { invoiceId });
  } catch (e) {
    console.error('notification error', e);
  }

  return updated;
};

export const listInvoicesForProject = async (projectId: string) => {
  return prisma.invoice.findMany({ where: { projectId }, include: { items: true }, orderBy: { createdAt: 'desc' } });
};
