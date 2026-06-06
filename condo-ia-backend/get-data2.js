const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function get() {
  const tenants = await prisma.tenant.findMany();
  console.log('Tenants:', JSON.stringify(tenants, null, 2));

  const expenses = await prisma.expense.findMany();
  console.log('Expenses:', JSON.stringify(expenses, null, 2));
  
  const users = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log('Admins:', JSON.stringify(users, null, 2));
}

get().catch(console.error).finally(() => prisma.$disconnect());
