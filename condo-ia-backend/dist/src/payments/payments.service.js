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
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    logger = new common_1.Logger(PaymentsService_1.name);
    genAI;
    constructor(prisma) {
        this.prisma = prisma;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async getPendingPayments() {
        return this.prisma.payment.findMany({
            where: { status: 'PENDING' },
            include: { invoice: { include: { unit: true } } },
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
    async extractOcrData(base64Image) {
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
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: data.invoiceId },
            select: { tenantId: true }
        });
        if (!invoice)
            throw new Error('Invoice not found');
        return this.prisma.payment.create({
            data: {
                invoiceId: data.invoiceId,
                amount: data.amount,
                referenceNumber: data.referenceNumber,
                status: 'PENDING',
                paymentMethod: 'TRANSFER',
                tenantId: invoice.tenantId,
                ocrConfidence: data.ocrConfidence
            }
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map