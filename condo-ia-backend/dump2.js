const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const apt2 = await prisma.unit.findFirst({
    where: { unitNumber: 'Apto 1-2' },
    include: { invoices: true }
  });
  console.log("Apto 1-2 Invoices:", JSON.stringify(apt2.invoices, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
