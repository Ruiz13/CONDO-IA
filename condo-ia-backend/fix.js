const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.invoice.update({
    where: { id: '0f944a09-d745-496c-81c6-235ca84929bb' },
    data: {
      amountPaid: 3.00,
      status: 'PARTIAL'
    }
  });
  console.log("Invoice 0f944a09... fixed to amountPaid=3.00, status=PARTIAL");
}

main().catch(console.error).finally(() => prisma.$disconnect());
