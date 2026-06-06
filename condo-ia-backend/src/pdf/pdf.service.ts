import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

export interface PdfInvoiceData {
  tenantName: string;
  logoBase64?: string | null;
  rif?: string | null;
  address?: string | null;
  phone?: string | null;
  invoiceNumber: string;
  unitNumber: string;
  aliquotPercentage: number;
  totalDebt: number;
  month: number;
  year: number;
  expensesDetails: any[];
  isPaid: boolean;
}

@Injectable()
export class PdfService {
  async generateInvoicePdf(data: PdfInvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Landscape? The image looks like landscape, but usually invoices are portrait. 
      // The image is very wide, let's stick to A4 landscape (841.89 x 595.28) to match the aspect ratio of the screenshot provided.
      // Actually A4 landscape is wide. The screenshot is definitely very wide.
      // Let's use A4 landscape.
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      const margin = 30;
      const width = 841.89 - margin * 2;
      let y = margin;

      // Colors
      const darkText = '#1A202C';
      const grayText = '#718096';
      const blueText = '#3182CE';
      const lightBg = '#F7FAFC';
      const cardBg = '#EDF2F7';
      const greenBg = '#C6F6D5';
      const greenText = '#22543D';

      // --- HEADER ---
      // Left side: Tenant Name & Info
      doc.fontSize(16).font('Helvetica-Bold').fillColor(darkText).text(data.tenantName.toUpperCase(), margin, y);
      
      // Logo in the center empty space, much larger
      if (data.logoBase64) {
        try {
          const base64Data = data.logoBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
          const imgBuffer = Buffer.from(base64Data, 'base64');
          // Move to the left (X=230) and size to 200x120
          doc.image(imgBuffer, 230, margin - 10, { fit: [200, 120], align: 'center' });
        } catch (e) {
          // Ignore logo errors
        }
      }

      y += 20;
      doc.fontSize(8).font('Helvetica').fillColor(grayText);
      doc.text('Junta de Condominio Activa', margin, y);
      y += 12;
      doc.text(`RIF: ${data.rif || 'J-00000000-0'}`, margin, y);
      y += 12;
      doc.text(`${data.address || 'Sin dirección registrada'}`, margin, y);

      // Right side: AVISO DE COBRO
      const rightColX = width - 250;
      doc.fontSize(12).font('Helvetica-Bold').fillColor(blueText)
         .text('AVISO DE COBRO / RECIBO', rightColX, margin, { width: 250, align: 'right' });
      
      // Separator line
      doc.moveTo(rightColX, margin + 15).lineTo(width + margin, margin + 15).lineWidth(1).strokeColor(blueText).stroke();

      doc.fontSize(8).font('Helvetica').fillColor(grayText);
      let rightY = margin + 25;
      const rightColLabelsX = rightColX;
      const rightColValuesX = rightColX + 80;

      const padZero = (num: number) => num < 10 ? `0${num}` : num.toString();
      const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const monthName = monthNames[data.month];

      doc.text('N° Control:', rightColLabelsX, rightY, { width: 70, align: 'right' });
      doc.fillColor(darkText).text(data.invoiceNumber, rightColValuesX, rightY, { width: 170, align: 'right' });
      rightY += 12;
      doc.fillColor(grayText).text('Periodo:', rightColLabelsX, rightY, { width: 70, align: 'right' });
      doc.fillColor(darkText).text(`${monthName} ${data.year}`, rightColValuesX, rightY, { width: 170, align: 'right' });
      rightY += 12;
      
      // Calculate end of month for "Vencimiento"
      const lastDay = new Date(data.year, data.month + 1, 0).getDate();

      doc.fillColor(grayText).text('Emisión:', rightColLabelsX, rightY, { width: 70, align: 'right' });
      doc.fillColor(darkText).text(`01/${padZero(data.month + 1)}/${data.year}`, rightColValuesX, rightY, { width: 170, align: 'right' });
      rightY += 12;
      doc.fillColor(grayText).text('Vencimiento:', rightColLabelsX, rightY, { width: 70, align: 'right' });
      doc.fillColor(darkText).text(`${padZero(lastDay)}/${padZero(data.month + 1)}/${data.year}`, rightColValuesX, rightY, { width: 170, align: 'right' });

      // Move y below the header, adding extra space for the larger logo
      // The logo goes from Y=20 to Y=140 (120 height max). Ensure we start below 150.
      y = Math.max(y + 50, rightY + 40, margin + 130);

      // --- INFO BLOCK ---
      doc.rect(margin, y, width, 40).fill(lightBg);
      
      // Top line of info block
      let infoY = y + 8;
      doc.fontSize(8).font('Helvetica-Bold').fillColor(grayText).text('Propietario:', margin + 10, infoY);
      doc.font('Helvetica').fillColor(darkText).text('Propietario del Inmueble', margin + 80, infoY);

      doc.font('Helvetica-Bold').fillColor(grayText).text('Inmueble:', margin + width / 2, infoY);
      doc.font('Helvetica').fillColor(darkText).text(data.unitNumber, margin + width / 2 + 50, infoY);

      // Bottom line of info block
      infoY += 15;
      doc.font('Helvetica-Bold').fillColor(grayText).text('Alícuota:', margin + 10, infoY);
      doc.font('Helvetica').fillColor(darkText).text(`${data.aliquotPercentage.toFixed(4)} %`, margin + 80, infoY);

      doc.font('Helvetica-Bold').fillColor(grayText).text('Estatus:', margin + width / 2, infoY);
      
      // Estatus Badge
      const statusText = data.isPaid ? 'PROCESADO / RECIBO' : 'RECIBO COBRO';
      const badgeBg = data.isPaid ? greenBg : '#FED7D7'; // light red
      const badgeText = data.isPaid ? greenText : '#C53030'; // dark red
      
      doc.rect(margin + width / 2 + 50, infoY - 2, 110, 12).fill(badgeBg);
      doc.fontSize(7).font('Helvetica-Bold').fillColor(badgeText).text(statusText, margin + width / 2 + 50, infoY, { width: 110, align: 'center' });

      y += 50;

      // --- KARDEX BOXES ---
      const boxWidth = (width - 30) / 4;
      const boxHeight = 40;
      
      let totalExpenses = data.expensesDetails.reduce((sum, exp) => sum + exp.amount, 0);
      let cuotaMes = totalExpenses * (data.aliquotPercentage / 100);

      // Box 1
      doc.rect(margin, y, boxWidth, boxHeight).fill(cardBg);
      doc.fontSize(7).font('Helvetica-Bold').fillColor(grayText).text('GASTOS COMUNIDAD', margin, y + 8, { width: boxWidth, align: 'center' });
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(`$ ${totalExpenses.toFixed(2)}`, margin, y + 20, { width: boxWidth, align: 'center' });

      // Box 2
      doc.rect(margin + boxWidth + 10, y, boxWidth, boxHeight).fill(cardBg);
      doc.fontSize(7).font('Helvetica-Bold').fillColor(grayText).text('CUOTA DEL MES', margin + boxWidth + 10, y + 8, { width: boxWidth, align: 'center' });
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(`$ ${cuotaMes.toFixed(2)}`, margin + boxWidth + 10, y + 20, { width: boxWidth, align: 'center' });

      // Box 3
      doc.rect(margin + boxWidth * 2 + 20, y, boxWidth, boxHeight).fill(cardBg);
      doc.fontSize(7).font('Helvetica-Bold').fillColor(grayText).text('SALDO ANTERIOR', margin + boxWidth * 2 + 20, y + 8, { width: boxWidth, align: 'center' });
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(`$ 0.00`, margin + boxWidth * 2 + 20, y + 20, { width: boxWidth, align: 'center' });

      // Box 4 (Dark)
      doc.rect(margin + boxWidth * 3 + 30, y, boxWidth, boxHeight).fill(darkText);
      doc.fontSize(7).font('Helvetica-Bold').fillColor(grayText).text('TOTAL A PAGAR', margin + boxWidth * 3 + 30, y + 8, { width: boxWidth, align: 'center' });
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF').text(`$ ${cuotaMes.toFixed(2)}`, margin + boxWidth * 3 + 30, y + 20, { width: boxWidth, align: 'center' });

      y += 60;

      // --- DISTRIBUCIÓN DE GASTOS TITLE ---
      doc.rect(margin, y, 3, 10).fill(blueText);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkText).text('DISTRIBUCIÓN DE GASTOS MENSUALES', margin + 8, y + 1);
      
      y += 15;

      // --- TABLE HEADER ---
      doc.rect(margin, y, width, 18).fill(darkText);
      let thY = y + 5;
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.text('DESCRIPCIÓN DEL GASTO / SERVICIO', margin + 10, thY);
      doc.text('TOTAL GENERAL ($)', margin + width - 200, thY, { width: 90, align: 'right' });
      doc.text('POR ALÍCUOTA ($)', margin + width - 100, thY, { width: 90, align: 'right' });

      y += 18;

      // --- TABLE ROWS ---
      let isEven = false;
      data.expensesDetails.forEach(exp => {
        if (y > 520) { // Page break check for landscape
          doc.addPage();
          y = margin;
        }

        if (isEven) {
          doc.rect(margin, y, width, 16).fill(lightBg);
        }
        
        let rowY = y + 4;
        doc.fontSize(7).font('Helvetica').fillColor(darkText);
        doc.text(exp.description, margin + 10, rowY, { width: width - 220, lineBreak: false });
        
        doc.text(`$ ${exp.amount.toFixed(2)}`, margin + width - 200, rowY, { width: 90, align: 'right' });
        
        let expCuota = exp.amount * (data.aliquotPercentage / 100);
        doc.text(`$ ${expCuota.toFixed(2)}`, margin + width - 100, rowY, { width: 90, align: 'right' });

        y += 16;
        isEven = !isEven;
      });

      // --- TABLE FOOTER ---
      doc.rect(margin, y, width, 18).fill(lightBg);
      // Top and bottom borders for footer
      doc.moveTo(margin, y).lineTo(margin + width, y).lineWidth(1).strokeColor('#E2E8F0').stroke();
      doc.moveTo(margin, y + 18).lineTo(margin + width, y + 18).stroke();

      let footY = y + 5;
      doc.fontSize(7).font('Helvetica-Bold').fillColor(darkText);
      doc.text('TOTALES DEL MES', margin + 10, footY);
      doc.text(`$ ${totalExpenses.toFixed(2)}`, margin + width - 200, footY, { width: 90, align: 'right' });
      doc.text(`$ ${cuotaMes.toFixed(2)}`, margin + width - 100, footY, { width: 90, align: 'right' });

      y += 40;

      if (y > 450) {
        doc.addPage();
        y = margin;
      }

      // --- FOOTER INFO ---
      // Left: Métodos de conciliación
      doc.rect(margin, y, 3, 10).fill(blueText);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkText).text('MÉTODOS DE CONCILIACIÓN', margin + 8, y + 1);
      
      let methodY = y + 20;
      doc.fontSize(7).font('Helvetica-Bold').fillColor(darkText);
      doc.text('Cuenta Corriente Banco Mercantil:', margin, methodY);
      doc.font('Helvetica').text('N° 0105-0024-12-1024567890', margin, methodY + 10);
      doc.text(`A nombre de: Junta de Condominio ${data.tenantName}`, margin, methodY + 20);
      doc.text(`RIF: ${data.rif || 'J-00000000-0'}`, margin, methodY + 30);
      doc.font('Helvetica-Bold').text(`Pago Móvil:`, margin, methodY + 40);
      doc.font('Helvetica').text(` Mercantil (0105) / Tel: ${data.phone || '0414-0000000'} / RIF: ${data.rif || 'J-00000000-0'}`, margin + 45, methodY + 40);

      // Right: Indicaciones
      let rightIndX = margin + width / 2;
      doc.rect(rightIndX, y, 3, 10).fill(blueText);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkText).text('INDICACIONES DE LA JUNTA', rightIndX + 8, y + 1);

      doc.fontSize(7).font('Helvetica').fillColor(grayText);
      doc.text('1. Reporte su pago vía canales digitales adjuntando el comprobante.', rightIndX, methodY);
      doc.text('2. Pagos posteriores al día 10 generarán recargos por mora.', rightIndX, methodY + 10);
      doc.text('3. Su solvencia garantiza los servicios de seguridad y bombeo.', rightIndX, methodY + 20);

      // Signatures
      y = methodY + 80;
      doc.fontSize(7).font('Helvetica').fillColor(grayText);
      doc.text('Administración del Condominio', margin, y, { width: width / 2, align: 'center' });
      doc.text('Control y Validación Financiera', margin, y + 10, { width: width / 2, align: 'center' });

      doc.text('Comité de Contraloría', margin + width / 2, y, { width: width / 2, align: 'center' });
      doc.text('Junta de Condominio Activa', margin + width / 2, y + 10, { width: width / 2, align: 'center' });

      doc.end();
    });
  }
}
