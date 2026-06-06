const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.unit.findMany({ include: { owner: true } });
  console.log('Units:', units.map(u => ({ id: u.id, unitNumber: u.unitNumber, ownerEmail: u.owner?.email })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
