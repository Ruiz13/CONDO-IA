const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
  await prisma.expense.updateMany({
    data: { isBilled: false }
  });
  console.log('Todos los gastos fueron restablecidos a NO FACTURADOS');
}

reset().finally(() => prisma.$disconnect());
