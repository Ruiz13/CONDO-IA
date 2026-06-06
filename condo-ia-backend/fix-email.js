const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.user.updateMany({
    where: { email: 'ruizherreno@hotmail.com.com' },
    data: { email: 'ruizherreno@hotmail.com' }
  });
  console.log("Fixed!");
}

fix().finally(() => prisma.$disconnect());
