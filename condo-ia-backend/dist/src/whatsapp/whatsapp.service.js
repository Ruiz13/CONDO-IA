"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const QRCode = __importStar(require("qrcode"));
let WhatsappService = WhatsappService_1 = class WhatsappService {
    logger = new common_1.Logger(WhatsappService_1.name);
    socket;
    qrCodeStr = null;
    isConnected = false;
    constructor() {
        this.initWhatsapp();
    }
    async initWhatsapp() {
        try {
            const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)('./auth_info_baileys');
            this.socket = (0, baileys_1.default)({
                auth: state,
                printQRInTerminal: true,
            });
            this.socket.ev.on('creds.update', saveCreds);
            this.socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    this.logger.log('Nuevo código QR generado');
                    this.qrCodeStr = await QRCode.toDataURL(qr);
                }
                if (connection === 'close') {
                    this.isConnected = false;
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
                    this.logger.error('Conexión cerrada', lastDisconnect?.error);
                    if (shouldReconnect) {
                        this.initWhatsapp();
                    }
                    else {
                        this.logger.error('Sesión cerrada manualmente. Eliminar carpeta auth_info_baileys para nuevo QR.');
                    }
                }
                else if (connection === 'open') {
                    this.logger.log('¡Conectado exitosamente a WhatsApp!');
                    this.isConnected = true;
                    this.qrCodeStr = null;
                }
            });
            this.socket.ev.on('messages.upsert', async (m) => {
                const msg = m.messages[0];
                if (!msg.message || msg.key.fromMe)
                    return;
                const remoteJid = msg.key.remoteJid;
                const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
                this.logger.log(`Mensaje recibido de ${remoteJid}: ${textMessage}`);
                const replyText = `¡Hola! Gracias por contactar a *Condo IA* 🏢🤖.\n\nHemos recibido tu solicitud para una demostración. Nuestro equipo revisará los datos de tu condominio y te contactaremos a la brevedad posible para coordinar la llamada.\n\n_¡El futuro de la gestión de condominios está aquí!_`;
                try {
                    await this.socket.sendMessage(remoteJid, { text: replyText });
                    this.logger.log(`Respuesta automática enviada a ${remoteJid}`);
                }
                catch (error) {
                    this.logger.error('Error enviando mensaje', error);
                }
            });
        }
        catch (error) {
            this.logger.error('Error inicializando Baileys', error);
        }
    }
    async logout() {
        if (this.socket) {
            await this.socket.logout();
            this.isConnected = false;
            this.qrCodeStr = null;
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map