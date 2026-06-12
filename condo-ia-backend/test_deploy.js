require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Database URL used:", process.env.DATABASE_URL);
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      tenant: { select: { name: true } }
    }
  });
  console.log("Total users found in DB:", users.length);
  const admins = users.filter(u => u.role === 'ADMIN');
  console.log("Admin users in DB:", admins);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
