import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.init();
  }

  async init() {
    try {
      // Usamos Ethereal Email para simular el envío en ambiente de desarrollo
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: testAccount.user, // usuario generado
          pass: testAccount.pass, // contraseña generada
        },
      });
      this.logger.log(`Ethereal Email configurado: ${testAccount.user}`);
    } catch (error) {
      this.logger.error('Error configurando Ethereal Email', error);
    }
  }

  async sendEmailWithAttachment(to: string, subject: string, text: string, pdfBuffer: Buffer, fileName: string) {
    if (!this.transporter) {
      this.logger.warn('El transporter de correo no está listo aún.');
      return;
    }
    
    try {
      const info = await this.transporter.sendMail({
        from: '"Condo IA" <noreply@condoia.com>',
        to,
        subject,
        text,
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: 'application/pdf'
          },
        ],
      });
      this.logger.log(`Correo con adjunto enviado exitosamente a ${to}. URL del Simulador para verlo: ${nodemailer.getTestMessageUrl(info)}`);
      
      // Guardar la URL en un archivo de texto para fácil acceso
      const urlFile = path.join(process.cwd(), 'factura-url.txt');
      fs.writeFileSync(urlFile, `URL de la última factura enviada a ${to}:\n${nodemailer.getTestMessageUrl(info)}\n`);
      
      return nodemailer.getTestMessageUrl(info);
    } catch (error) {
      this.logger.error('Error enviando correo con adjunto', error);
    }
  }

  async sendEmail(to: string, subject: string, text: string) {
    if (!this.transporter) {
      this.logger.warn('El transporter de correo no está listo aún.');
      return;
    }
    
    try {
      const info = await this.transporter.sendMail({
        from: '"Condo IA" <noreply@condoia.com>',
        to,
        subject,
        html: text, // Assuming text is actually HTML based on how it's called
      });
      this.logger.log(`Correo enviado exitosamente a ${to}. URL del Simulador para verlo: ${nodemailer.getTestMessageUrl(info)}`);
      return nodemailer.getTestMessageUrl(info);
    } catch (error) {
      this.logger.error('Error enviando correo', error);
    }
  }
}
