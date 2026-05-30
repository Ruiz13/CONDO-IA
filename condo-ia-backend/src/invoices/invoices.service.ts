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
    this.logger.log('Iniciando proceso automático de facturación...');
    
    try {
      const tenants = await this.prisma.tenant.findMany();
      
      for (const tenant of tenants) {
        // Obtener todos los gastos del mes (Para este MVP tomamos todos los gastos)
        const expenses = await this.prisma.expense.findMany({
          where: { tenantId: tenant.id }
        });

        if (expenses.length === 0) continue;

        let totalAll = 0;
        let totalAptsOnly = 0;

        for (const ex of expenses) {
          if (ex.appliesTo === 'ALL') totalAll += ex.amount;
          else if (ex.appliesTo === 'APARTMENTS_ONLY') totalAptsOnly += ex.amount;
        }

        const units = await this.prisma.unit.findMany({
          where: { tenantId: tenant.id }
        });

        // Sumar alícuota total de apartamentos (para cálculo relativo)
        let totalAptAliquot = 0;
        for (const u of units) {
          if (!u.isCommercial) totalAptAliquot += u.aliquotPercentage;
        }

        for (const u of units) {
          let amount = 0;
          if (u.isCommercial) {
            // El local solo paga su porcentaje de gastos generales ("Todos")
            amount = totalAll * (u.aliquotPercentage / 100);
          } else {
            // El apto paga su porcentaje general + porcentaje relativo de exclusivos
            const aptsOnlyShare = totalAptAliquot > 0 ? (u.aliquotPercentage / totalAptAliquot) : 0;
            amount = (totalAll * (u.aliquotPercentage / 100)) + (totalAptsOnly * aptsOnlyShare);
          }

          if (amount > 0) {
            const today = new Date();
            await this.prisma.invoice.create({
              data: {
                tenantId: tenant.id,
                unitId: u.id,
                month: today.getMonth() + 1,
                year: today.getFullYear(),
                totalAmount: parseFloat(amount.toFixed(2)),
                status: 'PENDING'
              }
            });
          }
        }
      }
      
      this.logger.log('Facturación completada. Recibos generados con cálculos de Alícuota Relativa.');
    } catch (error) {
      this.logger.error('Error durante la generación de recibos', error);
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

  async getPendingInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { 
        unit: { ownerId: userId },
        status: 'PENDING'
      },
      include: { unit: true },
      orderBy: { createdAt: 'desc' }
    });
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
