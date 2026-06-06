const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'ruizherreno@gmail.com' },
    data: { passwordHash: hash }
  });
  console.log('Superadmin password fixed to admin123');

  await prisma.user.update({
    where: { email: 'ruizherreno@hotmail.com' },
    data: { passwordHash: hash }
  });
  console.log('Admin password fixed to admin123');
}

main().finally(() => prisma.$disconnect());
