const express = require('express');
const { PORT } = require('./config/env');
const webhookRoutes = require('./routes/webhook.routes');

const app = express();
app.use(express.json());

// Montar Rutas
app.use('/webhook', webhookRoutes);

app.listen(PORT, () => {
    console.log(`Servidor de WhatsApp Bot corriendo en el puerto ${PORT}`);
});
