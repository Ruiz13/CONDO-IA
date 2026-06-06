const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const apt1 = await prisma.unit.findFirst({
    where: { unitNumber: 'Apto 1-1', tenantId: '59ff76b8-86ea-4166-8944-6f1f7ef57e2a' },
    include: { invoices: true }
  });
  console.log(JSON.stringify(apt1.invoices, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
