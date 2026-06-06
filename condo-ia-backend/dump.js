const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const invs = await prisma.invoice.findMany({ include: { unit: true }});
  console.log("Invoices:", JSON.stringify(invs, null, 2));

  const pays = await prisma.payment.findMany({ include: { unit: true }});
  console.log("Payments:", JSON.stringify(pays, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
