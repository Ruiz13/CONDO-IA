const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.message.findMany({orderBy: {createdAt: 'desc'}, take: 10})
  .then(msgs => console.log(JSON.stringify(msgs, null, 2)))
  .catch(console.error)
  .finally(() => { prisma.$disconnect(); process.exit(0); });
