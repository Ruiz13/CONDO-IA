import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

// Ejecutar prisma db push al arrancar para asegurar que la base de datos de producción esté actualizada
try {
  console.log('[STARTUP] Iniciando prisma db push...');
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = dbUrl.replace('-pooler', '').replace('&pgbouncer=true', '').replace('?pgbouncer=true', '');
  const stdout = execSync('npx prisma db push --accept-data-loss', {
    env: { ...process.env, DIRECT_URL: directUrl },
    stdio: 'pipe'
  });
  console.log('[STARTUP] Prisma db push completado con éxito:', stdout.toString());
} catch (error: any) {
  console.error('[STARTUP] Error en prisma db push:', error.message);
  if (error.stdout) console.log('[STARTUP] stdout:', error.stdout.toString());
  if (error.stderr) console.error('[STARTUP] stderr:', error.stderr.toString());
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
