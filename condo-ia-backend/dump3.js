const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.unit.findMany({
    where: { tenantId: '59ff76b8-86ea-4166-8944-6f1f7ef57e2a' },
    include: { invoices: true }
  });
  
  for (const u of units) {
     const sum = u.invoices.reduce((acc, i) => acc + i.totalAmount, 0);
     const paid = u.invoices.reduce((acc, i) => acc + i.amountPaid, 0);
     console.log(`${u.unitNumber}: Invoices: ${u.invoices.length}, Total Amount: ${sum}, Total Paid: ${paid}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
