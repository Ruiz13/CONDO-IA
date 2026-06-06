const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'ruizherreno@gmail.com' },
    data: { passwordHash: '$2b$10$9HQaV8/Fh0v4u9J3a50tIeuS7d1ePzL4tY32Fm5pZ/rA.X9cIfq9K' }
  });
  console.log('Password reset to admin123');
}

main().finally(() => prisma.$disconnect());
