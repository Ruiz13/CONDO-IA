"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
const pdf_service_1 = require("../pdf/pdf.service");
const email_service_1 = require("../email/email.service");
let BillingService = BillingService_1 = class BillingService {
    prisma;
    pdfService;
    emailService;
    logger = new common_1.Logger(BillingService_1.name);
    constructor(prisma, pdfService, emailService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.emailService = emailService;
    }
    async generateMonthlyBilling(tenantId) {
        try {
            const unbilledExpenses = await this.prisma.expense.findMany({
                where: { tenantId, isBilled: false },
            });
            if (unbilledExpenses.length === 0) {
                throw new common_1.HttpException('No hay gastos pendientes por facturar en este mes.', common_1.HttpStatus.BAD_REQUEST);
            }
            const totalExpenses = unbilledExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
            const units = await this.prisma.unit.findMany({
                where: { tenantId },
                include: { owner: true },
            });
            if (!tenant)
                throw new common_1.HttpException('Tenant no encontrado', common_1.HttpStatus.NOT_FOUND);
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            for (const unit of units) {
                const amountToPay = totalExpenses * (unit.aliquotPercentage / 100);
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
                const subject = `Factura de Condominio - Mes ${month}/${year} - Unidad ${unit.unitNumber}`;
                const text = `Hola,\n\nAdjuntamos el recibo de cobro correspondiente al mes ${month}/${year} por un total de $${amountToPay.toFixed(2)}.\n\nAtentamente,\nJunta de Condominio ${tenant.name}`;
                await this.emailService.sendEmailWithAttachment(unit.owner.email, subject, text, pdfBuffer, `Recibo_Condominio_${month}_${year}_U${unit.unitNumber}.pdf`);
            }
            await this.prisma.expense.updateMany({
                where: { id: { in: unbilledExpenses.map(e => e.id) } },
                data: { isBilled: true },
            });
            this.logger.log(`Facturación del mes ${month}/${year} generada exitosamente para el tenant ${tenantId}`);
            return { message: 'Facturación generada y recibos enviados correctamente.' };
        }
        catch (error) {
            this.logger.error('Error generando facturación', error);
            throw new common_1.HttpException(error.message || 'Error interno al generar facturación', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
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
                }
                catch (error) {
                    if (error.getStatus && error.getStatus() === common_1.HttpStatus.BAD_REQUEST) {
                        this.logger.log(`Condominio ${tenant.name}: No hay gastos pendientes este mes.`);
                    }
                    else {
                        this.logger.error(`Error procesando facturación para condominio ${tenant.name}`, error);
                    }
                }
            }
            this.logger.log('Proceso CRON de facturación completado.');
        }
        catch (error) {
            this.logger.error('Fallo crítico en el proceso CRON de facturación general', error);
        }
    }
};
exports.BillingService = BillingService;
__decorate([
    (0, schedule_1.Cron)('0 0 1 * * *', {
        name: 'monthly-billing',
        timeZone: 'America/Caracas'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingService.prototype, "processAllTenantsMonthlyBilling", null);
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        email_service_1.EmailService])
], BillingService);
//# sourceMappingURL=billing.service.js.map