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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const generative_ai_1 = require("@google/generative-ai");
const email_service_1 = require("../email/email.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    emailService;
    logger = new common_1.Logger(PaymentsService_1.name);
    genAI;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async getPendingPayments() {
        return this.prisma.payment.findMany({
            where: { status: 'PENDING' },
            include: { unit: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approvePayment(id, adminId) {
        let finalAdminId = adminId;
        if (!finalAdminId) {
            const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
            if (admin)
                finalAdminId = admin.id;
        }
        const oldPayment = await this.prisma.payment.findUnique({ where: { id } });
        if (!oldPayment || oldPayment.status !== 'PENDING')
            return null;
        const payment = await this.prisma.payment.update({
            where: { id },
            data: { status: 'APPROVED' },
            include: { unit: { include: { owner: true } } }
        });
        const pendingInvoices = await this.prisma.invoice.findMany({
            where: { unitId: payment.unitId, status: { in: ['PENDING', 'PARTIAL'] } },
            orderBy: { createdAt: 'asc' }
        });
        let remainingAmount = payment.amount;
        for (const invoice of pendingInvoices) {
            if (remainingAmount <= 0)
                break;
            const debt = invoice.totalAmount - invoice.amountPaid;
            if (remainingAmount >= debt) {
                await this.prisma.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        amountPaid: invoice.totalAmount,
                        status: 'PAID'
                    }
                });
                remainingAmount -= debt;
            }
            else {
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
        if (payment.unit?.owner?.email) {
            const emailHtml = `
        <h2>Hola, ${payment.unit.unitNumber}</h2>
        <p>Tu pago ha sido <strong>APROBADO</strong> exitosamente.</p>
        <p><strong>Monto Acreditado:</strong> $${payment.amount.toFixed(2)}</p>
        <p><strong>Referencia:</strong> ${payment.referenceNumber}</p>
        <p>Gracias por mantenerte al día con el condominio.</p>
      `;
            this.emailService.sendEmail(payment.unit.owner.email, 'Recibo de Pago Aprobado', emailHtml).catch(e => this.logger.error(e));
        }
        return payment;
    }
    async extractOcrData(base64Image) {
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
                        mimeType: 'image/jpeg',
                    },
                },
            ]);
            const responseText = result.response.text();
            const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJsonStr);
        }
        catch (error) {
            this.logger.error('Error procesando OCR', error);
            throw new Error('No se pudo procesar el comprobante');
        }
    }
    async reportPayment(data) {
        const unit = await this.prisma.unit.findUnique({
            where: { id: data.unitId },
            select: { tenantId: true }
        });
        if (!unit)
            throw new Error('Unit not found');
        return this.prisma.payment.create({
            data: {
                unitId: data.unitId,
                amount: data.amount,
                referenceNumber: data.referenceNumber,
                status: 'PENDING',
                paymentMethod: 'TRANSFER',
                tenantId: unit.tenantId,
                ocrConfidence: data.ocrConfidence
            }
        });
    }
    async getUserPayments(userId) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, email_service_1.EmailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map