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
const knowledge_service_1 = require("../knowledge/knowledge.service");
let ChatService = ChatService_1 = class ChatService {
    prisma;
    knowledgeService;
    logger = new common_1.Logger(ChatService_1.name);
    genAI;
    constructor(prisma, knowledgeService) {
        this.prisma = prisma;
        this.knowledgeService = knowledgeService;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async getAiResponse(userMessage, userId) {
        try {
            let tenantId = null;
            let contextString = '';
            let validUser = false;
            const cleanUserId = (userId && userId.trim()) ? userId.trim() : undefined;
            if (cleanUserId) {
                const user = await this.prisma.user.findUnique({ where: { id: cleanUserId } });
                if (user) {
                    validUser = true;
                    tenantId = user.tenantId;
                    try {
                        await this.prisma.message.create({
                            data: {
                                text: userMessage,
                                isBot: false,
                                userId: cleanUserId,
                                tenantId
                            },
                        });
                    }
                    catch (dbErr) {
                        this.logger.warn('No se pudo guardar mensaje del usuario en DB', dbErr);
                    }
                    const units = await this.prisma.unit.findMany({
                        where: { ownerId: userId },
                    });
                    if (units.length > 0) {
                        const unitIds = units.map(u => u.id);
                        const unitNames = units.map(u => u.unitNumber).join(', ');
                        const pendingInvoices = await this.prisma.invoice.findMany({
                            where: { unitId: { in: unitIds }, status: { in: ['PENDING', 'PARTIAL'] } },
                        });
                        const totalDebt = pendingInvoices.reduce((acc, inv) => acc + (inv.totalAmount - inv.amountPaid), 0);
                        let pendingPaymentsCount = 0;
                        try {
                            const pendingPayments = await this.prisma.payment.findMany({
                                where: { unitId: { in: unitIds }, status: 'PENDING' },
                                select: { id: true }
                            });
                            pendingPaymentsCount = pendingPayments.length;
                        }
                        catch (payErr) {
                            this.logger.warn('No se pudo consultar pagos pendientes debido a diferencia de esquema:', payErr);
                        }
                        contextString = `\nContexto del usuario actual:
- Unidades asociadas: ${unitNames}
- Deuda total pendiente: $${totalDebt.toFixed(2)} (${pendingInvoices.length} facturas)
- Pagos en revisión: ${pendingPaymentsCount}`;
                    }
                    else {
                        contextString = `\nContexto del usuario actual: No tiene unidades asociadas.`;
                    }
                }
                else {
                    this.logger.warn(`Usuario con id ${userId} no encontrado en la DB`);
                }
            }
            let knowledgeContext = '';
            if (tenantId) {
                knowledgeContext = await this.knowledgeService.getTenantContext(tenantId);
            }
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `Eres el conserje y analista financiero virtual inteligente del condominio "Condo IA". 
Tu misión es ayudar a los residentes de forma extremadamente amable, transparente y servicial.
Reglas:
1. Responde siempre en idioma español.
2. Sé conciso pero claro al explicar temas de dinero o gastos (no más de 3 párrafos).
3. Usa emojis para que se vea moderno.
4. Eres un experto leyendo facturas, recibos y balances financieros. Si el contexto incluye texto extraído de documentos, debes interpretarlo como datos oficiales del condominio (ej. gastos, proveedores, montos, meses).
5. Si un residente pregunta por detalles de un gasto o por qué varió un monto, busca en los "DOCUMENTOS OFICIALES" y explícaselo de forma sencilla y directa.

${knowledgeContext ? '\n--- DOCUMENTOS OFICIALES DEL CONDOMINIO ---\n' + knowledgeContext + '\n-------------------------------------------\n' : ''}
${contextString}

Mensaje del residente: ${userMessage}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const botText = response.text();
            if (cleanUserId && validUser) {
                try {
                    await this.prisma.message.create({
                        data: {
                            text: botText,
                            isBot: true,
                            userId: cleanUserId,
                            tenantId
                        },
                    });
                }
                catch (dbErr) {
                    this.logger.warn('No se pudo guardar respuesta del bot en DB', dbErr);
                }
            }
            return botText;
        }
        catch (error) {
            this.logger.error('Error al contactar a Gemini API', error);
            return 'Lo siento mucho, mi conexión cerebral está fallando en este momento. 🤕 Inténtalo más tarde.';
        }
    }
    async getChatHistory(userId) {
        return this.prisma.message.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getAuditHistory(tenantId) {
        return this.prisma.message.findMany({
            where: { tenantId },
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, knowledge_service_1.KnowledgeService])
], ChatService);
//# sourceMappingURL=chat.service.js.map