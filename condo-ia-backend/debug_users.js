const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { tenant: true } });
  console.log(users.map(u => ({
    email: u.email,
    role: u.role,
    tenantIsActive: u.tenant ? u.tenant.isActive : 'NO TENANT',
    pwd: u.passwordHash.substring(0, 10) + '...'
  })));
}

main().finally(() => prisma.$disconnect());
