const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.invoice.count();
  console.log("Invoices count:", c);
  await prisma.$disconnect();
}
check();
