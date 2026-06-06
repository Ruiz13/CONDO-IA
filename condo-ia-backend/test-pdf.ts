import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PdfService } from './src/pdf/pdf.service';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const pdfService = app.get(PdfService);

  let logoBase64: string | null = null;
  try {
    const logoBuffer = fs.readFileSync('C:\\Users\\matar\\Downloads\\CONDO-IA\\condo-ia-mobile\\assets\\images\\logo.png');
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch(e) { console.log('Logo no encontrado para el test'); }

  const pdfBuffer = await pdfService.generateInvoicePdf({
    tenantName: "CONDOMINIO RES. IMOLA",
    logoBase64: logoBase64,
    rif: "J-12345678-9",
    phone: "0414-1234567",
    address: "Av. Principal, Edificio Imola, Caracas",
    invoiceNumber: "FAC-ABC123",
    unitNumber: "A-12",
    aliquotPercentage: 1.5,
    totalDebt: 64.96,
    month: 6,
    year: 2026,
    expensesDetails: [
      { description: "Mantenimiento Ascensores", amount: 1500 },
      { description: "Pago Conserjería", amount: 400 },
      { description: "Electricidad Áreas Comunes", amount: 120 }
    ],
    isPaid: false
  });

  fs.writeFileSync('C:\\Users\\matar\\Downloads\\CONDO-IA\\test_invoice.pdf', pdfBuffer);
  console.log("PDF generado en C:\\Users\\matar\\Downloads\\CONDO-IA\\test_invoice.pdf");
  await app.close();
}
bootstrap();
