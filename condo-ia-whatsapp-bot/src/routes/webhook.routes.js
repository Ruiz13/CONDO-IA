const express = require('express');
const router = express.Router();
const { verifyWebhook, processMessage } = require('../controllers/webhook.controller');

// GET /webhook - Para la configuración inicial en Meta for Developers
router.get('/', verifyWebhook);

// POST /webhook - Para recibir los mensajes de WhatsApp
router.post('/', processMessage);

module.exports = router;
