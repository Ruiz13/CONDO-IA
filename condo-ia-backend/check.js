const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const t = await prisma.tenant.findMany({ include: { units: { include: { invoices: true } } } });
  for (const tenant of t) {
    console.log(`Tenant: ${tenant.name}`);
    console.log(`Units count: ${tenant.units.length}`);
    const totalInvoices = tenant.units.reduce((acc, u) => acc + u.invoices.length, 0);
    console.log(`Total invoices: ${totalInvoices}`);
    if (tenant.units.length > 0 && tenant.units[0].invoices.length > 0) {
      console.log(`Sample invoice:`, tenant.units[0].invoices[0]);
    }
  }
}
check().then(() => prisma.$disconnect());
