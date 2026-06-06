const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateLocalPdf() {
  const tenantId = '59ff76b8-86ea-4166-8944-6f1f7ef57e2a';
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  
  // ALL expenses (since we want to show all)
  const expenses = await prisma.expense.findMany({
    where: { tenantId }
  });

  if (expenses.length === 0) {
    console.log("No expenses found");
    return;
  }

  let totalAll = 0;
  expenses.forEach(e => {
    if (e.appliesTo === 'ALL') totalAll += e.amount;
  });

  const { PdfService } = require('./dist/src/pdf/pdf.service.js');
  const pdfService = new PdfService();
  
  // Buscar un apartamento (no comercial)
  const unit = await prisma.unit.findFirst({ where: { isCommercial: false, tenantId } });
  const realAliquot = unit ? unit.aliquotPercentage : 1.363636;
  const unitNumber = unit ? unit.unitNumber : 'Apto 1A';

  // Lógica real que toma en cuenta gastos de "TODOS" y "SOLO APARTAMENTOS"
  let amountToPay = 0;
  
  const allUnits = await prisma.unit.findMany({ where: { tenantId } });
  let totalAptAliquot = 0;
  for (const u of allUnits) {
    if (!u.isCommercial) totalAptAliquot += u.aliquotPercentage;
  }

  let totalAllGastos = 0;
  let totalAptsOnlyGastos = 0;
  for (const ex of expenses) {
    if (ex.appliesTo === 'ALL') totalAllGastos += ex.amount;
    else if (ex.appliesTo === 'APARTMENTS_ONLY') totalAptsOnlyGastos += ex.amount;
  }

  const aptsOnlyShare = totalAptAliquot > 0 ? (realAliquot / totalAptAliquot) : 0;
  amountToPay = (totalAllGastos * (realAliquot / 100)) + (totalAptsOnlyGastos * aptsOnlyShare);

  const pdfBuffer = await pdfService.generateInvoicePdf(
    tenant.name,
    tenant.logoBase64,
    unitNumber,
    realAliquot,
    amountToPay,
    new Date().getMonth() + 1,
    new Date().getFullYear(),
    expenses
  );

  const outputPath = path.join(__dirname, '..', 'condo-ia-admin-web', 'public', 'factura_completa.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`PDF generado en: ${outputPath}`);
}

generateLocalPdf().finally(() => prisma.$disconnect());
