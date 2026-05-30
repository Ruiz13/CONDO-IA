import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  
  constructor(private prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async getAiResponse(userMessage: string, userId?: string): Promise<string> {
    try {
      // Guardar mensaje del usuario
      await this.prisma.message.create({
        data: { text: userMessage, isBot: false },
      });

      // Recopilar contexto del usuario si se proporciona el userId
      let contextString = '';
      if (userId) {
        // Buscar unidades del usuario
        const units = await this.prisma.unit.findMany({
          where: { ownerId: userId },
        });

        if (units.length > 0) {
          const unitIds = units.map(u => u.id);
          const unitNames = units.map(u => u.unitNumber).join(', ');

          // Buscar facturas pendientes
          const pendingInvoices = await this.prisma.invoice.findMany({
            where: { unitId: { in: unitIds }, status: 'PENDING' },
          });
          const totalDebt = pendingInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

          // Buscar pagos en revisión (estado PENDING asociado a esas facturas)
          const pendingPayments = await this.prisma.payment.findMany({
            where: { invoice: { unitId: { in: unitIds } }, status: 'PENDING' },
          });

          contextString = `\nContexto del usuario actual:
- Unidades asociadas: ${unitNames}
- Deuda total pendiente: $${totalDebt.toFixed(2)} (${pendingInvoices.length} facturas)
- Pagos en revisión: ${pendingPayments.length}`;
        } else {
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

      // Guardar respuesta del bot
      await this.prisma.message.create({
        data: { text: botText, isBot: true },
      });

      return botText;
    } catch (error) {
      this.logger.error('Error al contactar a Gemini API', error);
      return 'Lo siento mucho, mi conexión cerebral está fallando en este momento. 🤕 Inténtalo más tarde.';
    }
  }
}
