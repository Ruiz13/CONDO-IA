const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const updated = await prisma.user.update({
    where: { email: 'admin@resimola.com' },
    data: { passwordHash: hash, mustChangePassword: false }
  });
  
  console.log('✅ Password del admin actualizada a: admin123');
  console.log('Usuario:', updated.email, '| Rol:', updated.role);
}

main().catch(console.error).finally(() => prisma.$disconnect());
