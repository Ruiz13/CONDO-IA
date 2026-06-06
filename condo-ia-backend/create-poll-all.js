const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPollForAll() {
  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    await prisma.poll.create({
      data: {
        tenantId: tenant.id,
        question: "¿Estás de acuerdo con el nuevo sistema Condo-IA?",
        options: {
          create: [
            { text: "Sí, me encanta" },
            { text: "No mucho" }
          ]
        }
      }
    });
    console.log(`Poll created for tenant: ${tenant.name}`);
  }
}

createPollForAll().finally(() => prisma.$disconnect());
