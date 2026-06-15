const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('TOTAL USUARIOS:', users.length);
  
  const admin = users.find(u => u.role === 'ADMIN');
  console.log('UN ADMIN:', admin ? admin.email : 'N/A');
  
  const residents = users.filter(u => u.role === 'RESIDENT');
  console.log('TOTAL RESIDENTES:', residents.length);
  
  if (residents.length > 0) {
    console.log('Ejemplo Residente:', residents[0].email, 'Nombre:', residents[0].name);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
