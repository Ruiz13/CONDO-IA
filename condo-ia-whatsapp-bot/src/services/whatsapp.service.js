const axios = require('axios');
const { GRAPH_API_TOKEN, PHONE_NUMBER_ID } = require('../config/env');

async function sendWhatsAppMessage(to, text) {
    try {
        if (!GRAPH_API_TOKEN || !PHONE_NUMBER_ID) {
            console.error('Faltan credenciales de Meta (Token o ID)');
            return;
        }

        const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
        
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "text",
            text: {
                preview_url: false,
                body: text
            }
        };

        const config = {
            headers: {
                'Authorization': `Bearer ${GRAPH_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        await axios.post(url, payload, config);
        console.log(`Mensaje enviado exitosamente a ${to} (vía Meta Cloud API)`);
        
    } catch (error) {
        console.error('Error enviando mensaje por Meta API:', error.response ? error.response.data : error.message);
    }
}

module.exports = { sendWhatsAppMessage };
