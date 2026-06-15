const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../config/env');
const { SYSTEM_PROMPT } = require('../utils/prompts');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getAI() {
    return new GoogleGenerativeAI(GEMINI_API_KEY);
}

async function generateResponse(userPhone, messageText) {
    try {
        // 1. Obtener historial previo de la BD (últimos 20 mensajes)
        const previousChats = await prisma.whatsappChatHistory.findMany({
            where: { phone: userPhone },
            orderBy: { createdAt: 'asc' },
            take: 20
        });

        // Formatear historial para Gemini (role: "user" o "model")
        const history = previousChats.map(chat => ({
            role: chat.role,
            parts: [{ text: chat.content }]
        }));

        // 2. Configurar el modelo
        const ai = getAI();
        const model = ai.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        });

        const chat = model.startChat({ history });

        // 3. Enviar nuevo mensaje a Gemini
        const result = await chat.sendMessage(messageText);
        const responseText = await result.response.text();

        // 4. Guardar la interacción actual en la BD de Condo-IA
        await prisma.whatsappChatHistory.createMany({
            data: [
                { phone: userPhone, role: 'user', content: messageText },
                { phone: userPhone, role: 'model', content: responseText }
            ]
        });

        return responseText;
    } catch (error) {
        console.error('Error generando respuesta con Gemini:', error);
        return 'Lo siento, estoy teniendo problemas técnicos en este momento. ¿Podrías intentar de nuevo más tarde? 🛠️';
    }
}

module.exports = { generateResponse };
