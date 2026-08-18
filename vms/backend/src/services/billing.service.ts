import { PrismaClient } from '@prisma/client';
import { generateInvoiceForProject } from './invoice.service.js';

const prisma = new PrismaClient();

export const runBilling = async () => {
  // find projects that have billable items
  const projects = await prisma.project.findMany();

  const results: Array<{ projectId: string; invoiceId?: string; error?: string }> = [];

  for (const p of projects) {
    try {
      const hasTimesheets = await prisma.timesheet.count({ where: { projectId: p.id, status: 'APPROVED', billed: false } });
      const hasMilestones = await prisma.milestone.count({ where: { projectId: p.id, status: 'APPROVED', billedAt: null } });
      if (hasTimesheets === 0 && hasMilestones === 0) continue;

      const inv = await generateInvoiceForProject(p.id);
      results.push({ projectId: p.id, invoiceId: inv.id });
    } catch (e: any) {
      results.push({ projectId: p.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return results;
};
