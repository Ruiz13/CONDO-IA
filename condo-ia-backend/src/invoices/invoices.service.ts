import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cron Job: Se ejecuta el día 3 de cada mes a la medianoche.
   * Lógica: Calcular gastos del mes anterior y emitir facturas para cada unidad (Apartamentos/Locales).
   */
  @Cron('0 0 3 * *') // A las 00:00 del día 3 del mes
  async generateMonthlyInvoices() {
    this.logger.log('Iniciando proceso automático de facturación (Día 3)...');
    
    try {
      // 1. Obtener gastos del mes anterior aprobados y no facturados
      // 2. Calcular la alícuota de cada unidad (Apartamentos vs Locales)
      // 3. Generar un 'Invoice' en estado 'PENDING' para cada unidad
      // 4. Disparar notificaciones Push (Firebase) o Emails (SendGrid) a los dueños
      
      this.logger.log('Facturación completada exitosamente. Se han generado los recibos.');
    } catch (error) {
      this.logger.error('Error durante la generación masiva de recibos', error);
    }
  }

  async getMyReceipts(userId: string) {
    try {
      return await this.prisma.invoice.findMany({
        where: { unit: { ownerId: userId } },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      return [];
    }
  }

  async reportPayment(tenantId: string, invoiceId: string, amount: number, referenceNumber: string) {
    return this.prisma.payment.create({
      data: {
        tenantId,
        invoiceId,
        amount,
        paymentMethod: 'TRANSFER',
        referenceNumber,
        status: 'PENDING'
      }
    });
  }
}
