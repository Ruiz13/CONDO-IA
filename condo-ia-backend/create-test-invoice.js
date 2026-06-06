const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addInvoices() {
  try {
    const units = await prisma.unit.findMany();
    for (const unit of units) {
      // Create a test invoice for each unit
      await prisma.invoice.create({
        data: {
          tenantId: unit.tenantId,
          unitId: unit.id,
          month: 6,
          year: 2026,
          totalAmount: 150.00,
          status: 'PENDING'
        }
      });
    }
    console.log("¡Facturas de prueba creadas con éxito!");
  } catch (error) {
    console.error("Error creating invoices:", error);
  } finally {
    await prisma.$disconnect();
  }
}
addInvoices();
