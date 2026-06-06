import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Servir archivos estáticos
  app.use('/uploads', express.static('uploads'));

  app.enableCors(); // Fundamental para permitir peticiones desde el túnel web
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
