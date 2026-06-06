const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function get() {
  const t = await prisma.tenant.findMany();
  const e = await prisma.expense.findMany();
  const i = await prisma.invoice.findMany();
  console.log('Tenants:', t);
  console.log('Expenses:', e);
  console.log('Invoices:', i);
}

get().catch(console.error).finally(() => prisma.$disconnect());
