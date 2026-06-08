const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const t = await prisma.tenant.findFirst();
  console.log('Tenant:', t?.id);
  if(t) {
    try {
      const ex = await prisma.expense.create({
        data: {
          tenantId: t.id,
          description: 'Prueba',
          amount: 100,
          appliesTo: 'ALL'
        }
      });
      console.log(ex);
    } catch (e) {
      console.error(e);
    }
  }
}
run();
