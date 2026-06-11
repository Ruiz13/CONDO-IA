import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';

import { KnowledgeService } from '../knowledge/knowledge.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  
  constructor(private prisma: PrismaService, private knowledgeService: KnowledgeService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async getAiResponse(userMessage: string, userId?: string): Promise<string> {
    try {
      let tenantId: string | null = null;
      let contextString = '';
      let validUser = false;

      // Sanitizar userId: si es string vacío o espacios, tratarlo como indefinido
      const cleanUserId = (userId && userId.trim()) ? userId.trim() : undefined;

      if (cleanUserId) {
        const user = await this.prisma.user.findUnique({ where: { id: cleanUserId } });
        if (user) {
          validUser = true;
          tenantId = user.tenantId;

          // Guardar mensaje del usuario (solo si el usuario existe en la DB)
          try {
            await this.prisma.message.create({
              data: { 
                text: userMessage, 
                isBot: false,
                userId: cleanUserId,
                tenantId
              },
            });
          } catch (dbErr) {
            this.logger.warn('No se pudo guardar mensaje del usuario en DB', dbErr);
          }

          // Buscar unidades del usuario
          const units = await this.prisma.unit.findMany({
            where: { ownerId: userId },
          });

          if (units.length > 0) {
            const unitIds = units.map(u => u.id);
            const unitNames = units.map(u => u.unitNumber).join(', ');

            // Buscar facturas pendientes
            const pendingInvoices = await this.prisma.invoice.findMany({
              where: { unitId: { in: unitIds }, status: { in: ['PENDING', 'PARTIAL'] } },
            });
            const totalDebt = pendingInvoices.reduce((acc, inv) => acc + (inv.totalAmount - inv.amountPaid), 0);

            // Buscar pagos en revisión
            const pendingPayments = await this.prisma.payment.findMany({
              where: { unitId: { in: unitIds }, status: 'PENDING' },
            });

            contextString = `\nContexto del usuario actual:
- Unidades asociadas: ${unitNames}
- Deuda total pendiente: $${totalDebt.toFixed(2)} (${pendingInvoices.length} facturas)
- Pagos en revisión: ${pendingPayments.length}`;
          } else {
            contextString = `\nContexto del usuario actual: No tiene unidades asociadas.`;
          }
        } else {
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

      // Guardar respuesta del bot (solo si el usuario es válido)
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
        } catch (dbErr) {
          this.logger.warn('No se pudo guardar respuesta del bot en DB', dbErr);
        }
      }

      return botText;
    } catch (error) {
      this.logger.error('Error al contactar a Gemini API', error);
      return 'Lo siento mucho, mi conexión cerebral está fallando en este momento. 🤕 Inténtalo más tarde.';
    }
  }

  async getChatHistory(userId: string) {
    return this.prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAuditHistory(tenantId: string) {
    return this.prisma.message.findMany({
      where: { tenantId },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
