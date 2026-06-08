const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Usamos la DATABASE_URL de Render — reemplazar si es diferente
async function main() {
  const users = await prisma.user.findMany({
    include: { tenant: { select: { name: true, isActive: true } } },
    orderBy: { role: 'asc' }
  });

  console.log(`\n=== TOTAL USUARIOS: ${users.length} ===\n`);
  users.forEach(u => {
    console.log(`[${u.role}] ${u.email}`);
    console.log(`  Tenant: ${u.tenant ? u.tenant.name : 'SIN TENANT'} | Activo: ${u.tenant ? u.tenant.isActive : '-'}`);
    console.log(`  Hash: ${u.passwordHash.substring(0, 15)}...`);
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
