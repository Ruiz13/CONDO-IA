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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const prisma_service_1 = require("../prisma.service");
let ChatService = ChatService_1 = class ChatService {
    prisma;
    logger = new common_1.Logger(ChatService_1.name);
    genAI;
    constructor(prisma) {
        this.prisma = prisma;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async getAiResponse(userMessage, userId) {
        try {
            await this.prisma.message.create({
                data: { text: userMessage, isBot: false },
            });
            let contextString = '';
            if (userId) {
                const units = await this.prisma.unit.findMany({
                    where: { ownerId: userId },
                });
                if (units.length > 0) {
                    const unitIds = units.map(u => u.id);
                    const unitNames = units.map(u => u.unitNumber).join(', ');
                    const pendingInvoices = await this.prisma.invoice.findMany({
                        where: { unitId: { in: unitIds }, status: 'PENDING' },
                    });
                    const totalDebt = pendingInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
                    const pendingPayments = await this.prisma.payment.findMany({
                        where: { invoice: { unitId: { in: unitIds } }, status: 'PENDING' },
                    });
                    contextString = `\nContexto del usuario actual:
- Unidades asociadas: ${unitNames}
- Deuda total pendiente: $${totalDebt.toFixed(2)} (${pendingInvoices.length} facturas)
- Pagos en revisión: ${pendingPayments.length}`;
                }
                else {
                    contextString = `\nContexto del usuario actual: No tiene unidades asociadas.`;
                }
            }
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `Eres el conserje y administrador virtual inteligente del condominio "Condo IA". 
Tu misión es ayudar a los residentes de forma extremadamente amable y servicial.
Reglas:
1. Responde siempre en idioma español.
2. Sé muy conciso (no más de 3 párrafos).
3. Usa emojis para que se vea moderno.
${contextString}

Mensaje del residente: ${userMessage}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const botText = response.text();
            await this.prisma.message.create({
                data: { text: botText, isBot: true },
            });
            return botText;
        }
        catch (error) {
            this.logger.error('Error al contactar a Gemini API', error);
            return 'Lo siento mucho, mi conexión cerebral está fallando en este momento. 🤕 Inténtalo más tarde.';
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map