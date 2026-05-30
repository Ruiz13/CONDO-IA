import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async getPendingPayments() {
    return this.prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: { invoice: { include: { unit: true } } },
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

    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    if (payment.invoiceId) {
      await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'PAID' },
      });
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

    return payment;
  }

  async extractOcrData(base64Image: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

  async reportPayment(data: { invoiceId: string, amount: number, referenceNumber: string, ocrConfidence?: number }) {
    // Buscar la factura para obtener el tenantId
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      select: { tenantId: true }
    });

    if (!invoice) throw new Error('Invoice not found');

    return this.prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amount: data.amount,
        referenceNumber: data.referenceNumber,
        status: 'PENDING',
        paymentMethod: 'TRANSFER', // Valor por defecto
        tenantId: invoice.tenantId,
        ocrConfidence: data.ocrConfidence
      }
    });
  }
}
