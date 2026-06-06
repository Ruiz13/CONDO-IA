const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the unit with unitNumber 1-1
  const unit = await prisma.unit.findFirst({
    where: { unitNumber: '1-1' }
  });

  if (!unit) {
    console.log('Unit 1-1 not found');
    return;
  }

  console.log('Found unit:', unit);

  // Delete associated invoices/payments? We probably should just delete the user first if there are cascade issues.
  // Wait, let's look at schema to see cascade.
  // But to be safe, delete all payments, invoices, messages, user, unit.

  // Let's just try to delete the unit and let the DB throw if it can't.
  try {
    // If unit has invoices
    await prisma.invoice.deleteMany({ where: { unitId: unit.id } });
    await prisma.payment.deleteMany({ where: { unitId: unit.id } });
    
    await prisma.unit.delete({ where: { id: unit.id } });
    console.log('Unit deleted.');

    if (unit.ownerId) {
      await prisma.message.deleteMany({ where: { userId: unit.ownerId } });
      await prisma.user.delete({ where: { id: unit.ownerId } });
      console.log('User deleted.');
    }
  } catch (e) {
    console.error('Error deleting:', e);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
