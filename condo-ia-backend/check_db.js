const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.payment.count();
  const i = await prisma.invoice.count();
  const e = await prisma.expense.count();
  const t = await prisma.tenant.count();
  console.log(`DB has ${t} tenants, ${p} payments, ${i} invoices, ${e} expenses`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
