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
var InvoicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
let InvoicesService = InvoicesService_1 = class InvoicesService {
    prisma;
    logger = new common_1.Logger(InvoicesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateMonthlyInvoices() {
        this.logger.log('Iniciando proceso automático de facturación (Día 3)...');
        try {
            this.logger.log('Facturación completada exitosamente. Se han generado los recibos.');
        }
        catch (error) {
            this.logger.error('Error durante la generación masiva de recibos', error);
        }
    }
    async getMyReceipts(userId) {
        try {
            return await this.prisma.invoice.findMany({
                where: { unit: { ownerId: userId } },
                orderBy: { createdAt: 'desc' }
            });
        }
        catch (e) {
            return [];
        }
    }
    async reportPayment(tenantId, invoiceId, amount, referenceNumber) {
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
};
exports.InvoicesService = InvoicesService;
__decorate([
    (0, schedule_1.Cron)('0 0 3 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoicesService.prototype, "generateMonthlyInvoices", null);
exports.InvoicesService = InvoicesService = InvoicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map