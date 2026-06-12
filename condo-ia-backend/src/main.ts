import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

// Ejecutar prisma db push al arrancar para asegurar que la base de datos de producción esté actualizada (en segundo plano)
try {
  console.log('[STARTUP] Iniciando prisma db push en segundo plano...');
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = dbUrl.replace('-pooler', '').replace('&pgbouncer=true', '').replace('?pgbouncer=true', '');
  exec('npx prisma db push --accept-data-loss', {
    env: { ...process.env, DIRECT_URL: directUrl }
  }, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error('[STARTUP] Error en prisma db push:', error.message);
      console.error('[STARTUP] stderr:', stderr);
      console.log('[STARTUP] stdout:', stdout);
    } else {
      console.log('[STARTUP] Prisma db push completado con éxito.');
      console.log('[STARTUP] stdout:', stdout);
    }
  });
} catch (err: any) {
  console.error('[STARTUP] Error al iniciar subprocess de db push:', err.message);
}

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
