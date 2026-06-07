const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const res = await prisma.$queryRaw`SELECT datname FROM pg_database;`;
  console.log(res);
  await prisma.$disconnect();
}
check();
