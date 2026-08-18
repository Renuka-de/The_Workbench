import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users: Array<{ name: string; email: string; passwordHash: string; role: 'VENDOR' | 'CONTRACTOR' | 'PROJECT_MANAGER' }> = [
    { name: 'Vendor Test', email: 'vendor@test.com', passwordHash, role: 'VENDOR' },
    { name: 'Contractor Test', email: 'contractor@test.com', passwordHash, role: 'CONTRACTOR' },
    { name: 'PM Test', email: 'pm@test.com', passwordHash, role: 'PROJECT_MANAGER' },
  ];

  const createdUsers = {} as Record<string, any>;

  for (const user of users) {
    const saved = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    });

    createdUsers[user.email] = saved;
  }

  const project = await prisma.project.upsert({
    where: { id: 'ecommerce-backend-project' },
    update: {
      name: 'E-Commerce Backend',
      description: 'Core platform work for the storefront and order APIs.',
      vendorId: createdUsers['vendor@test.com'].id,
      projectManagerId: createdUsers['pm@test.com'].id,
      status: 'ACTIVE',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-12-31'),
    },
    create: {
      id: 'ecommerce-backend-project',
      name: 'E-Commerce Backend',
      description: 'Core platform work for the storefront and order APIs.',
      vendorId: createdUsers['vendor@test.com'].id,
      projectManagerId: createdUsers['pm@test.com'].id,
      status: 'ACTIVE',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  await prisma.contractorAssignment.upsert({
    where: {
      projectId_contractorId: { projectId: project.id, contractorId: createdUsers['contractor@test.com'].id },
    },
    update: {
      status: 'PENDING',
      assignedAt: new Date('2026-08-10'),
    },
    create: {
      projectId: project.id,
      contractorId: createdUsers['contractor@test.com'].id,
      status: 'PENDING',
      assignedAt: new Date('2026-08-10'),
    },
  });

  console.log('Seeded test users and sample project flow');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
