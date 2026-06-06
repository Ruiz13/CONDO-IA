const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }).then(users => {
  console.log(users.map(u => ({ email: u.email, role: u.role })));
  p.$disconnect();
});
