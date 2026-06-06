const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateInvoice() {
  try {
    // Buscar la factura pendiente y actualizar su monto
    await prisma.invoice.updateMany({
      where: { status: 'PENDING' },
      data: { totalAmount: 24550.87 }
    });
    console.log("¡Factura actualizada a 24550.87!");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
updateInvoice();
