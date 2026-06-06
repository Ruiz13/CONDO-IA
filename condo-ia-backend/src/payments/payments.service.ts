import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private prisma: PrismaService, private emailService: EmailService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async getPendingPayments() {
    return this.prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: { unit: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approvePayment(id: string, adminId?: string) {
    // If no adminId provided, find the first admin to act as "ghost admin" for the MVP demo
    let finalAdminId = adminId;
    if (!finalAdminId) {
      const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin) finalAdminId = admin.id;
    }

    const oldPayment = await this.prisma.payment.findUnique({ where: { id } });
    if (!oldPayment || oldPayment.status !== 'PENDING') return null;

    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { unit: { include: { owner: true } } }
    });

    // Partial payments distribution
    // Find all pending/partial invoices for this unit, ordered by oldest first
    const pendingInvoices = await this.prisma.invoice.findMany({
      where: { unitId: payment.unitId, status: { in: ['PENDING', 'PARTIAL'] } },
      orderBy: { createdAt: 'asc' }
    });

    let remainingAmount = payment.amount;

    for (const invoice of pendingInvoices) {
      if (remainingAmount <= 0) break;

      const debt = invoice.totalAmount - invoice.amountPaid;
      
      if (remainingAmount >= debt) {
        // Pay it fully
        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: invoice.totalAmount,
            status: 'PAID'
          }
        });
        remainingAmount -= debt;
      } else {
        // Partial payment
        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: invoice.amountPaid + remainingAmount,
            status: 'PARTIAL'
          }
        });
        remainingAmount = 0;
      }
    }

    if (finalAdminId && oldPayment) {
      await this.prisma.auditLog.create({
        data: {
          tenantId: payment.tenantId,
          userId: finalAdminId,
          action: 'PAYMENT_APPROVED',
          tableName: 'Payment',
          oldData: JSON.stringify({ status: oldPayment.status }),
          newData: JSON.stringify({ status: payment.status })
        }
      });
    }

    // Send Email to the owner
    if (payment.unit?.owner?.email) {
      const emailHtml = `
        <h2>Hola, ${payment.unit.unitNumber}</h2>
        <p>Tu pago ha sido <strong>APROBADO</strong> exitosamente.</p>
        <p><strong>Monto Acreditado:</strong> $${payment.amount.toFixed(2)}</p>
        <p><strong>Referencia:</strong> ${payment.referenceNumber}</p>
        <p>Gracias por mantenerte al día con el condominio.</p>
      `;
      // No we await because we want it fast, but we don't want to block if email fails.
      this.emailService.sendEmail(payment.unit.owner.email, 'Recibo de Pago Aprobado', emailHtml).catch(e => this.logger.error(e));
    }

    return payment;
  }

  async extractOcrData(base64Image: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Analiza este comprobante bancario de pago. 
Extrae únicamente el número de referencia (referenceNumber) y el monto total transferido o depositado (amount) (solo el número, sin el símbolo del dólar).
Debes devolver la respuesta ÚNICAMENTE en este formato JSON exacto:
{"referenceNumber": "12345", "amount": 100.50}
No incluyas markdown, comillas raras ni texto adicional.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg', // Asumiremos jpeg/png para el OCR
          },
        },
      ]);
      const responseText = result.response.text();
      
      // Limpiar texto si Gemini pone comillas invertidas
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJsonStr);
    } catch (error) {
      this.logger.error('Error procesando OCR', error);
      throw new Error('No se pudo procesar el comprobante');
    }
  }

  async reportPayment(data: { unitId: string, amount: number, referenceNumber: string, ocrConfidence?: number }) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: data.unitId },
      select: { tenantId: true }
    });

    if (!unit) throw new Error('Unit not found');

    return this.prisma.payment.create({
      data: {
        unitId: data.unitId,
        amount: data.amount,
        referenceNumber: data.referenceNumber,
        status: 'PENDING',
        paymentMethod: 'TRANSFER', // Valor por defecto
        tenantId: unit.tenantId,
        ocrConfidence: data.ocrConfidence
      }
    });
  }

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        unit: {
          ownerId: userId
        }
      },
      include: {
        unit: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
