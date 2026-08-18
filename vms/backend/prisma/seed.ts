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

  for (const user of users) {
    await prisma.user.upsert({
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
  }

  console.log('Seeded test users');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
