const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const msgs = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: true }
  });
  
  msgs.reverse().forEach(m => {
    console.log(`[${m.isBot ? 'IA' : 'User'}] ${m.text}`);
  });
}

main().finally(() => prisma.$disconnect());
