const { WEBHOOK_VERIFY_TOKEN } = require('../config/env');
const { generateResponse } = require('../services/ai.service');
const { sendWhatsAppMessage } = require('../services/whatsapp.service');

// GET: Verificación del Webhook por parte de Meta
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.status(400).send('Faltan parámetros de verificación');
    }
};

// POST: Recepción de mensajes desde Meta Cloud API
const processMessage = async (req, res) => {
    try {
        const body = req.body;

        // Log global del payload entrante para depuración en Render
        console.log('--- WEBHOOK PAYLOAD ENTRANTE ---');
        console.log(JSON.stringify(body, null, 2));
        console.log('--------------------------------');

        // Validar que el webhook proviene de la API de WhatsApp
        if (body.object === 'whatsapp_business_account') {
            
            // Iterar sobre las entradas (Meta puede enviar eventos en batch)
            if (body.entry && body.entry.length > 0) {
                for (const entry of body.entry) {
                    if (entry.changes && entry.changes.length > 0) {
                        for (const change of entry.changes) {
                            const value = change.value;
                            
                            // Verificar si es un mensaje
                            if (value.messages && value.messages.length > 0) {
                                const message = value.messages[0];
                                const contact = value.contacts && value.contacts[0];
                                
                                const phoneNumber = message.from;
                                const messageType = message.type;
                                const senderName = contact?.profile?.name || 'Desconocido';

                                if (messageType === 'text') {
                                    const messageText = message.text.body;
                                    console.log(`Mensaje de ${phoneNumber} (${senderName}): ${messageText}`);

                                    // 1. Generar respuesta con IA y base de datos (Contexto)
                                    const aiResponse = await generateResponse(phoneNumber, messageText);

                                    // 2. Enviar la respuesta vía Meta Cloud API
                                    await sendWhatsAppMessage(phoneNumber, aiResponse);
                                } else {
                                    console.log(`Mensaje ignorado (tipo no soportado): ${messageType}`);
                                }
                            } else if (value.statuses && value.statuses.length > 0) {
                                // Es una actualización de estado (enviado, entregado, leído)
                                console.log(`Actualización de estado recibida: ${value.statuses[0].status} para mensaje ${value.statuses[0].id}`);
                            } else {
                                console.log('Evento de cambio no reconocido o sin mensajes/estados.');
                            }
                        }
                    }
                }
            }
            res.sendStatus(200); // Meta exige que siempre se responda 200 OK rápidamente
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error procesando el Webhook de Meta:', error);
        res.sendStatus(500);
    }
};

module.exports = {
    verifyWebhook,
    processMessage
};
