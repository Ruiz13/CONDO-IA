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

  async getAiResponse(userMessage: string): Promise<string> {
    try {
      // Guardar mensaje del usuario
      await this.prisma.message.create({
        data: { text: userMessage, isBot: false },
      });

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Eres el conserje y administrador virtual inteligente del condominio "Condo IA". 
Tu misión es ayudar a los residentes de forma extremadamente amable y servicial.
Reglas:
1. Responde siempre en idioma español.
2. Sé muy conciso (no más de 3 párrafos).
3. Usa emojis para que se vea moderno.

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
