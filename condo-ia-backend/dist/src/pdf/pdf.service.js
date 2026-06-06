"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
let PdfService = class PdfService {
    async generateInvoicePdf(data) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);
            const margin = 30;
            const width = 841.89 - margin * 2;
            let y = margin;
            const darkText = '#1A202C';
            const grayText = '#718096';
            const blueText = '#3182CE';
            const lightBg = '#F7FAFC';
            const cardBg = '#EDF2F7';
            const greenBg = '#C6F6D5';
            const greenText = '#22543D';
            doc.fontSize(16).font('Helvetica-Bold').fillColor(darkText).text(data.tenantName.toUpperCase(), margin, y);
            if (data.logoBase64) {
                try {
                    const base64Data = data.logoBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                    const imgBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(imgBuffer, 230, margin - 10, { fit: [200, 120], align: 'center' });
                }
                catch (e) {
                }
            }
            y += 20;
            doc.fontSize(8).font('Helvetica').fillColor(grayText);
            doc.text('Junta de Condominio Activa', margin, y);
            y += 12;
            doc.text(`RIF: ${data.rif || 'J-00000000-0'}`, margin, y);
            y += 12;
            doc.text(`${data.address || 'Sin dirección registrada'}`, margin, y);
            const rightColX = width - 250;
            doc.fontSize(12).font('Helvetica-Bold').fillColor(blueText)
                .text('AVISO DE COBRO / RECIBO', rightColX, margin, { width: 250, align: 'right' });
            doc.moveTo(rightColX, margin + 15).lineTo(width + margin, margin + 15).lineWidth(1).strokeColor(blueText).stroke();
            doc.fontSize(8).font('Helvetica').fillColor(grayText);
            let rightY = margin + 25;
            const rightColLabelsX = rightColX;
            const rightColValuesX = rightColX + 80;
            const padZero = (num) => num < 10 ? `0${num}` : num.toString();
            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            const monthName = monthNames[data.month];
            doc.text('N° Control:', rightColLabelsX, rightY, { width: 70, align: 'right' });
            doc.fillColor(darkText).text(data.invoiceNumber, rightColValuesX, rightY, { width: 170, align: 'right' });
            rightY += 12;
            doc.fillColor(grayText).text('Periodo:', rightColLabelsX, rightY, { width: 70, align: 'right' });
            doc.fillColor(darkText).text(`${monthName} ${data.year}`, rightColValuesX, rightY, { width: 170, align: 'right' });
            rightY += 12;
            const lastDay = new Date(data.year, data.month + 1, 0).getDate();
            doc.fillColor(grayText).text('Emisión:', rightColLabelsX, rightY, { width: 70, align: 'right' });
            doc.fillColor(darkText).text(`01/${padZero(data.month + 1)}/${data.year}`, rightColValuesX, rightY, { width: 170, align: 'right' });
            rightY += 12;
            doc.fillColor(grayText).text('Vencimiento:', rightColLabelsX, rightY, { width: 70, align: 'right' });
            doc.fillColor(darkText).text(`${padZero(lastDay)}/${padZero(data.month + 1)}/${data.year}`, rightColValuesX, rightY, { width: 170, align: 'right' });
            y = Math.max(y + 50, rightY + 40, margin + 130);
            doc.rect(margin, y, width, 40).fill(lightBg);
            let infoY = y + 8;
            doc.fontSize(8).font('Helvetica-Bold').fillColor(grayText).text('Propietario:', margin + 10, infoY);
            doc.font('Helvetica').fillColor(darkText).text('Propietario del Inmueble', margin + 80, infoY);
            doc.font('Helvetica-Bold').fillColor(grayText).text('Inmueble:', margin + width / 2, infoY);
            doc.font('Helvetica').fillColor(darkText).text(data.unitNumber, margin + width / 2 + 50, infoY);
            infoY += 15;
            doc.font('Helvetica-Bold').fillColor(grayText).text('Alícuota:', margin + 10, infoY);
            doc.font('Helvetica').fillColor(darkText).text(`${data.aliquotPercentage.toFixed(4)} %`, margin + 80, infoY);
            doc.font('Helvetica-Bold').fillColor(grayText).text('Estatus:', margin + width / 2, infoY);
            const statusText = data.isPaid ? 'PROCESADO / RECIBO' : 'RECIBO COBRO';
            const badgeBg = data.isPaid ? greenBg : '#FED7D7';
            const badgeText = data.isPaid ? greenText : '#C53030';
            doc.rect(margin + width / 2 + 50, infoY - 2, 110, 12).fill(badgeBg);
            doc.fontSize(7).font('Helvetica-Bold').fillColor(badgeText).text(statusText, margin + width / 2 + 50, infoY, { width: 110, align: 'center' });
            y += 50;
            const boxWidth = (width - 30) / 4;
            const boxHeight = 40;
            let totalExpenses = data.expensesDetails.reduce((sum, exp) => sum + exp.amount, 0);
            let cuotaMes = totalExpenses * (data.aliquotPercentage / 100);
            doc.rect(margin, y, boxWidth, boxHeight).fill(cardBg);
            doc.fontSize(7).font('Helvetica-Bold').fillColor(grayText).text('GASTOS COMUNIDAD', margin, y + 8, { width: boxWidth, align: 'center' });
            doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(`$ ${totalExpenses.toFixed(2)}`, margin, y + 20, { width: boxWidth, align: 'center' });
            doc.rect(margin + boxWidth + 10, y, boxWidth, boxHeight).fill(cardBg);
            doc.fontSize(7).font('Helvetica-Bold').fillColor(grayText).text('CUOTA DEL MES', margin + boxWidth + 10, y + 8, { width: boxWidth, align: 'center' });
            doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(`$ ${cuotaMes.toFixed(2)}`, margin + boxWidth + 10, y + 20, { width: boxWidth, align: 'center' });
            doc.rect(margin + boxWidth * 2 + 20, y, boxWidth, boxHeight).fill(cardBg);
            doc.fontSize(7).font('Helvetica-Bold').fillColor(grayText).text('SALDO ANTERIOR', margin + boxWidth * 2 + 20, y + 8, { width: boxWidth, align: 'center' });
            doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(`$ 0.00`, margin + boxWidth * 2 + 20, y + 20, { width: boxWidth, align: 'center' });
            doc.rect(margin + boxWidth * 3 + 30, y, boxWidth, boxHeight).fill(darkText);
            doc.fontSize(7).font('Helvetica-Bold').fillColor(grayText).text('TOTAL A PAGAR', margin + boxWidth * 3 + 30, y + 8, { width: boxWidth, align: 'center' });
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF').text(`$ ${cuotaMes.toFixed(2)}`, margin + boxWidth * 3 + 30, y + 20, { width: boxWidth, align: 'center' });
            y += 60;
            doc.rect(margin, y, 3, 10).fill(blueText);
            doc.fontSize(9).font('Helvetica-Bold').fillColor(darkText).text('DISTRIBUCIÓN DE GASTOS MENSUALES', margin + 8, y + 1);
            y += 15;
            doc.rect(margin, y, width, 18).fill(darkText);
            let thY = y + 5;
            doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF');
            doc.text('DESCRIPCIÓN DEL GASTO / SERVICIO', margin + 10, thY);
            doc.text('TOTAL GENERAL ($)', margin + width - 200, thY, { width: 90, align: 'right' });
            doc.text('POR ALÍCUOTA ($)', margin + width - 100, thY, { width: 90, align: 'right' });
            y += 18;
            let isEven = false;
            data.expensesDetails.forEach(exp => {
                if (y > 520) {
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
            doc.rect(margin, y, width, 18).fill(lightBg);
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
            let rightIndX = margin + width / 2;
            doc.rect(rightIndX, y, 3, 10).fill(blueText);
            doc.fontSize(9).font('Helvetica-Bold').fillColor(darkText).text('INDICACIONES DE LA JUNTA', rightIndX + 8, y + 1);
            doc.fontSize(7).font('Helvetica').fillColor(grayText);
            doc.text('1. Reporte su pago vía canales digitales adjuntando el comprobante.', rightIndX, methodY);
            doc.text('2. Pagos posteriores al día 10 generarán recargos por mora.', rightIndX, methodY + 10);
            doc.text('3. Su solvencia garantiza los servicios de seguridad y bombeo.', rightIndX, methodY + 20);
            y = methodY + 80;
            doc.fontSize(7).font('Helvetica').fillColor(grayText);
            doc.text('Administración del Condominio', margin, y, { width: width / 2, align: 'center' });
            doc.text('Control y Validación Financiera', margin, y + 10, { width: width / 2, align: 'center' });
            doc.text('Comité de Contraloría', margin + width / 2, y, { width: width / 2, align: 'center' });
            doc.text('Junta de Condominio Activa', margin + width / 2, y + 10, { width: width / 2, align: 'center' });
            doc.end();
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map