"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const generative_ai_1 = require("@google/generative-ai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
        const payment = await this.prisma.payment.create({
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
        if (data.receiptBase64) {
            try {
                const uploadDir = path.join(process.cwd(), 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const fileName = `${payment.id}.jpg`;
                const filePath = path.join(uploadDir, fileName);
                const base64Data = data.receiptBase64.replace(/^data:image\/\w+;base64,/, "");
                await fs.promises.writeFile(filePath, base64Data, 'base64');
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { receiptUrl: `/uploads/${fileName}` }
                });
            }
            catch (err) {
                this.logger.error('Error guardando imagen de pago', err);
            }
        }
        const pendingInvoices = await this.prisma.invoice.findMany({
            where: { unitId: data.unitId, status: { in: ['PENDING', 'PARTIAL'] } }
        });
        const totalDebt = pendingInvoices.reduce((acc, inv) => acc + (inv.totalAmount - inv.amountPaid), 0);
        const matchesTotal = Math.abs(totalDebt - data.amount) < 0.01;
        const matchesSingle = pendingInvoices.some(inv => Math.abs((inv.totalAmount - inv.amountPaid) - data.amount) < 0.01);
        if (totalDebt > 0 && (matchesTotal || matchesSingle)) {
            const approvedPayment = await this.approvePayment(payment.id);
            if (approvedPayment) {
                return approvedPayment;
            }
        }
        return payment;
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
    async reconcileTransactions(bankTransactions, adminId) {
        const pendingPayments = await this.prisma.payment.findMany({
            where: { status: 'PENDING' },
            include: { unit: true }
        });
        const matched = [];
        const unmatchedBank = [];
        const matchedPaymentIds = new Set();
        const cleanRef = (ref) => {
            if (ref === undefined || ref === null)
                return '';
            return ref.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        };
        for (const bankTx of bankTransactions) {
            const bankRefClean = cleanRef(bankTx.referenceNumber);
            const bankAmount = Number(bankTx.amount);
            if (!bankRefClean || isNaN(bankAmount)) {
                unmatchedBank.push({ ...bankTx, reason: 'Referencia o monto inválido' });
                continue;
            }
            const match = pendingPayments.find(payment => {
                if (matchedPaymentIds.has(payment.id))
                    return false;
                const paymentRefClean = cleanRef(payment.referenceNumber);
                const refMatch = paymentRefClean === bankRefClean ||
                    (paymentRefClean.length >= 4 && bankRefClean.endsWith(paymentRefClean)) ||
                    (bankRefClean.length >= 4 && paymentRefClean.endsWith(bankRefClean));
                const amountMatch = Math.abs(payment.amount - bankAmount) < 0.01;
                return refMatch && amountMatch;
            });
            if (match) {
                matchedPaymentIds.add(match.id);
                const approved = await this.approvePayment(match.id, adminId);
                matched.push({
                    bankTx,
                    payment: approved || match
                });
            }
            else {
                unmatchedBank.push(bankTx);
            }
        }
        const unmatchedSystem = pendingPayments.filter(p => !matchedPaymentIds.has(p.id));
        return {
            matchedCount: matched.length,
            unmatchedBankCount: unmatchedBank.length,
            unmatchedSystemCount: unmatchedSystem.length,
            matched,
            unmatchedBank,
            unmatchedSystem
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, email_service_1.EmailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map