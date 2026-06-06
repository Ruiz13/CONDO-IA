import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private emailService: EmailService,
  ) {}

  async generateMonthlyBilling(tenantId: string) {
    try {
      // 1. Obtener los gastos no facturados
      const unbilledExpenses = await this.prisma.expense.findMany({
        where: { tenantId, isBilled: false },
      });

      if (unbilledExpenses.length === 0) {
        throw new HttpException('No hay gastos pendientes por facturar en este mes.', HttpStatus.BAD_REQUEST);
      }

      const totalExpenses = unbilledExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      // 2. Obtener el tenant y todas las unidades
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      const units = await this.prisma.unit.findMany({
        where: { tenantId },
        include: { owner: true },
      });

      if (!tenant) throw new HttpException('Tenant no encontrado', HttpStatus.NOT_FOUND);

      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // 3. Procesar cada unidad
      for (const unit of units) {
        const amountToPay = totalExpenses * (unit.aliquotPercentage / 100);

        // Crear la factura en BD
        const invoice = await this.prisma.invoice.create({
          data: {
            tenantId,
            unitId: unit.id,
            month,
            year,
            totalAmount: amountToPay,
            status: 'PENDING',
          },
        });

        const invoiceNumber = `FAC-${invoice.id.substring(0, 6).toUpperCase()}`;

        const pdfBuffer = await this.pdfService.generateInvoicePdf({
          tenantName: tenant.name,
          logoBase64: tenant.logoBase64,
          rif: tenant.rif,
          phone: tenant.phone,
          address: tenant.address,
          invoiceNumber: invoiceNumber,
          unitNumber: unit.unitNumber,
          aliquotPercentage: unit.aliquotPercentage,
          totalDebt: amountToPay,
          month: month,
          year: year,
          expensesDetails: unbilledExpenses,
          isPaid: false
        });

        // Enviar Correo
        const subject = `Factura de Condominio - Mes ${month}/${year} - Unidad ${unit.unitNumber}`;
        const text = `Hola,\n\nAdjuntamos el recibo de cobro correspondiente al mes ${month}/${year} por un total de $${amountToPay.toFixed(2)}.\n\nAtentamente,\nJunta de Condominio ${tenant.name}`;
        
        // Temporarily disabled to avoid hanging without SMTP config
        /*
        await this.emailService.sendEmailWithAttachment(
          unit.owner.email,
          subject,
          text,
          pdfBuffer,
          `Recibo_Condominio_${month}_${year}_U${unit.unitNumber}.pdf`
        );
        */
      }

      // 4. Marcar gastos como facturados
      await this.prisma.expense.updateMany({
        where: { id: { in: unbilledExpenses.map(e => e.id) } },
        data: { isBilled: true },
      });

      this.logger.log(`Facturación del mes ${month}/${year} generada exitosamente para el tenant ${tenantId}`);
      return { message: 'Facturación generada y recibos enviados correctamente.' };

    } catch (error) {
      this.logger.error('Error generando facturación', error);
      throw new HttpException(error.message || 'Error interno al generar facturación', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Se ejecuta el día 1 de cada mes a las 00:00 AM
  @Cron('0 0 1 * * *', {
    name: 'monthly-billing',
    timeZone: 'America/Caracas'
  })
  async processAllTenantsMonthlyBilling() {
    this.logger.log('Iniciando proceso CRON de facturación mensual automática...');
    try {
      const activeTenants = await this.prisma.tenant.findMany({
        where: { isActive: true }
      });

      for (const tenant of activeTenants) {
        try {
          this.logger.log(`Procesando facturación para el condominio: ${tenant.name} (${tenant.id})`);
          await this.generateMonthlyBilling(tenant.id);
        } catch (error) {
          // Ignoramos el error 400 de "No hay gastos pendientes", no es un fallo crítico
          if (error.getStatus && error.getStatus() === HttpStatus.BAD_REQUEST) {
            this.logger.log(`Condominio ${tenant.name}: No hay gastos pendientes este mes.`);
          } else {
            this.logger.error(`Error procesando facturación para condominio ${tenant.name}`, error);
          }
        }
      }
      this.logger.log('Proceso CRON de facturación completado.');
    } catch (error) {
      this.logger.error('Fallo crítico en el proceso CRON de facturación general', error);
    }
  }
}
