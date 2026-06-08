const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ver todos los tenants y su estado
  const tenants = await prisma.tenant.findMany();
  console.log('=== TENANTS ===');
  tenants.forEach(t => {
    console.log(`ID: ${t.id} | Nombre: ${t.name} | Activo: ${t.isActive}`);
  });

  // Reactivar todos los tenants suspendidos
  const result = await prisma.tenant.updateMany({
    where: { isActive: false },
    data: { isActive: true }
  });

  console.log(`\n✅ Tenants reactivados: ${result.count}`);
  
  // Verificar
  const after = await prisma.tenant.findMany();
  console.log('\n=== ESTADO FINAL ===');
  after.forEach(t => {
    console.log(`${t.name} -> isActive: ${t.isActive}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
