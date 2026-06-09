import { Injectable, Logger } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private socket: any;
  public qrCodeStr: string | null = null;
  public isConnected: boolean = false;

  constructor() {
    this.initWhatsapp();
  }

  async initWhatsapp() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: true,
      });

      this.socket.ev.on('creds.update', saveCreds);

      this.socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.log('Nuevo código QR generado');
          // Generamos el Data URL del QR para enviarlo al Frontend
          this.qrCodeStr = await QRCode.toDataURL(qr);
        }

        if (connection === 'close') {
          this.isConnected = false;
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          this.logger.error('Conexión cerrada', lastDisconnect?.error);
          
          if (shouldReconnect) {
            this.initWhatsapp();
          } else {
            this.logger.error('Sesión cerrada manualmente. Eliminar carpeta auth_info_baileys para nuevo QR.');
          }
        } else if (connection === 'open') {
          this.logger.log('¡Conectado exitosamente a WhatsApp!');
          this.isConnected = true;
          this.qrCodeStr = null; // Limpiamos el QR ya que nos conectamos
        }
      });

      this.socket.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        // Solo responder si no es un mensaje propio y es válido
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        this.logger.log(`Mensaje recibido de ${remoteJid}: ${textMessage}`);

        // Lógica de Autorespuesta (Si es un cliente nuevo o dicen "demostración")
        // Como es una prueba en desarrollo, contestamos a todo.
        const replyText = `¡Hola! Gracias por contactar a *Condo IA* 🏢🤖.\n\nHemos recibido tu solicitud para una demostración. Nuestro equipo revisará los datos de tu condominio y te contactaremos a la brevedad posible para coordinar la llamada.\n\n_¡El futuro de la gestión de condominios está aquí!_`;

        try {
          await this.socket.sendMessage(remoteJid, { text: replyText });
          this.logger.log(`Respuesta automática enviada a ${remoteJid}`);
        } catch (error) {
          this.logger.error('Error enviando mensaje', error);
        }
      });

    } catch (error) {
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
}
