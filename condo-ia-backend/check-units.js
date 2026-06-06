const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const tenants = await prisma.tenant.findMany();
  console.log("Tenants:", tenants);
  const units = await prisma.unit.findMany({
    include: { invoices: true }
  });
  console.log("Units with invoices:", JSON.stringify(units, null, 2));
  await prisma.$disconnect();
}
check();
