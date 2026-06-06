const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVotes() {
  const polls = await prisma.poll.findMany({
    include: {
      options: {
        include: { _count: { select: { votes: true } } }
      },
      votes: true
    }
  });
  console.log(JSON.stringify(polls, null, 2));
}

checkVotes().finally(() => prisma.$disconnect());
