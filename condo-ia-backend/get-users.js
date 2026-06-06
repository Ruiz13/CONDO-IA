const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function get() {
  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    include: { tenant: true }
  });
  console.log("Users:");
  for (const u of users) {
    const isAlberto = await bcrypt.compare('Alberto', u.passwordHash).catch(()=>false);
    console.log(u.email, u.role, u.tenant?.name, isAlberto ? "PASSWORD IS Alberto" : "");
  }
}

get().finally(() => prisma.$disconnect());
