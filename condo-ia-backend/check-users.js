const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  const tenants = await prisma.tenant.findMany();
  console.log("Tenants:", tenants);
  await prisma.$disconnect();
}
check();
