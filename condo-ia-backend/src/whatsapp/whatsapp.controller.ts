import { Controller, Get, Post } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  getStatus() {
    return {
      connected: this.whatsappService.isConnected,
    };
  }

  @Get('qr')
  getQrCode() {
    if (this.whatsappService.isConnected) {
      return { error: 'Ya estás conectado a WhatsApp. No se requiere QR.' };
    }
    
    if (!this.whatsappService.qrCodeStr) {
      return { error: 'Generando QR... Intenta de nuevo en unos segundos.' };
    }

    return { qrImage: this.whatsappService.qrCodeStr };
  }

  @Post('logout')
  async logout() {
    await this.whatsappService.logout();
    return { success: true, message: 'Sesión cerrada correctamente' };
  }
}
