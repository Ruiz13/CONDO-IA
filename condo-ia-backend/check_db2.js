const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log('TENANTS:', JSON.stringify(tenants, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
