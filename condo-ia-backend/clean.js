const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    console.log(`Clearing ${tenant.name}...`);
    const p = await prisma.payment.deleteMany({ where: { tenantId: tenant.id } });
    const i = await prisma.invoice.deleteMany({ where: { tenantId: tenant.id } });
    const e = await prisma.expense.deleteMany({ where: { tenantId: tenant.id } });
    console.log(`Deleted ${p.count} payments, ${i.count} invoices, ${e.count} expenses.`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
