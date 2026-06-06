import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

import { EmailService } from '../email/email.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private prisma: PrismaService, private emailService: EmailService) {}

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
        // Solo obtener gastos no facturados
        const expenses = await this.prisma.expense.findMany({
          where: { tenantId: tenant.id, isBilled: false }
        });

        if (expenses.length === 0) continue;

        // Extraer los ids para marcarlos como facturados luego
        const expenseIds = expenses.map(e => e.id);

        let totalAll = 0;
        let totalAptsOnly = 0;

        for (const ex of expenses) {
          if (ex.appliesTo === 'ALL') totalAll += ex.amount;
          else if (ex.appliesTo === 'APARTMENTS_ONLY') totalAptsOnly += ex.amount;
        }

        const units = await this.prisma.unit.findMany({
          where: { tenantId: tenant.id },
          include: { owner: true }
        });

        // Sumar alícuota total de apartamentos (para cálculo relativo)
        let totalAptAliquot = 0;
        for (const u of units) {
          if (!u.isCommercial) totalAptAliquot += u.aliquotPercentage;
        }

        const invoicesData: any[] = [];
        for (const u of units) {
          let amount = 0;
          if (u.isCommercial) {
            amount = totalAll * (u.aliquotPercentage / 100);
          } else {
            const aptsOnlyShare = totalAptAliquot > 0 ? (u.aliquotPercentage / totalAptAliquot) : 0;
            amount = (totalAll * (u.aliquotPercentage / 100)) + (totalAptsOnly * aptsOnlyShare);
          }

          if (amount > 0) {
            const today = new Date();
            invoicesData.push({
              tenantId: tenant.id,
              unitId: u.id,
              month: today.getMonth() + 1,
              year: today.getFullYear(),
              totalAmount: parseFloat(amount.toFixed(2)),
              status: 'PENDING'
            });
          }
        }
        
        if (invoicesData.length > 0) {
          await this.prisma.invoice.createMany({
            data: invoicesData
          });
          
          // Marcar los gastos como facturados
          await this.prisma.expense.updateMany({
            where: { id: { in: expenseIds } },
            data: { isBilled: true }
          });

          // Enviar correos a cada propietario
          for (const u of units) {
            const invoice = invoicesData.find(inv => inv.unitId === u.id);
            if (invoice && u.owner?.email) {
              const emailHtml = `
                <h2>Hola, ${u.unitNumber}</h2>
                <p>Se ha generado tu facturación para el mes ${invoice.month}/${invoice.year}.</p>
                <p><strong>Deuda del Mes:</strong> $${invoice.totalAmount.toFixed(2)}</p>
                <p>Ingresa a la aplicación para ver los detalles y reportar tu pago.</p>
                <p>Atentamente, la Administración.</p>
              `;
              this.emailService.sendEmail(u.owner.email, 'Nueva Facturación Mensual', emailHtml).catch(e => this.logger.error(e));
            }
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
        status: { in: ['PENDING', 'PARTIAL'] }
      },
      include: { unit: true },
      orderBy: { createdAt: 'desc' }
    });
  }

}
