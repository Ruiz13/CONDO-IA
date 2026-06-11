# Plan: Bot de WhatsApp para CONDO IA (Sin Meta API)

> **Fecha:** 2026-06-10  
> **Estado:** Pendiente de implementación  
> **Prioridad:** Media — Implementar solo cuando el resto del sistema esté estable

---

## 1. ¿Es Viable? — Respuesta Honesta

**Sí, es viable**, pero con condiciones importantes. A continuación explico exactamente qué falló la primera vez y cómo evitarlo.

### ¿Por qué falló antes?

| Problema | Causa Real |
|----------|------------|
| El bot "se volvió loco" | No filtraba grupos ni estados. Respondía a TODOS los mensajes (incluyendo grupos de 200 personas) |
| Colapsó el servidor | Baileys consumió toda la RAM de Render (512MB gratis) al procesar cientos de mensajes simultáneos |
| Se perdía la sesión | Render tiene **almacenamiento efímero**: cada vez que el servidor se reinicia, se borra la carpeta `auth_info_baileys` y hay que escanear el QR de nuevo |
| No contestaba | La URL del frontend apuntaba a producción pero el bot corría en local |

### ¿Qué opciones existen sin usar Meta?

| Librería | Método | Riesgo de Baneo | RAM | Recomendación |
|----------|--------|-----------------|-----|---------------|
| **Baileys** | Reverse-engineering del protocolo WA | Medio | ~100-200MB | ✅ Mejor opción |
| **whatsapp-web.js** | Puppeteer (Chrome headless) | Medio | ~500MB+ | ❌ Muy pesado |
| **Venom-bot** | Similar a whatsapp-web.js | Medio | ~400MB+ | ❌ Pesado |

**Baileys sigue siendo la mejor opción** — es liviano y no necesita un navegador completo. El problema no fue la librería, fue cómo la implementamos.

---

## 2. Requisitos Previos (ANTES de implementar)

### 2.1 Servidor con Almacenamiento Persistente
El plan gratuito de Render **no sirve** para el bot de WhatsApp porque borra los archivos al reiniciar. Opciones:

| Opción | Costo | Almacenamiento | Recomendación |
|--------|-------|----------------|---------------|
| Render pagado (Starter) | $7/mes | Persistente con disco | ✅ Más fácil (ya usas Render) |
| Railway.app | $5/mes | Persistente | ✅ Alternativa sólida |
| VPS (Hostinger, DigitalOcean) | $4-6/mes | Completo | ⚠️ Requiere más configuración |
| Guardar auth en Base de Datos | $0 extra | Usa Neon DB existente | ✅ **Opción recomendada** |

**Opción recomendada:** Guardar las credenciales de sesión de Baileys directamente en la base de datos PostgreSQL (Neon) que ya tienes. Así no dependes del sistema de archivos de Render.

### 2.2 Número de Teléfono Dedicado
- Usar un número **exclusivo** para el bot (NO tu número personal)
- Un chip prepago económico es suficiente
- Si WhatsApp lo suspende, no pierdes tu número personal

### 2.3 Límites Claros
- El bot solo responde a **mensajes directos** (no grupos, no estados)
- Máximo 1 respuesta por número cada 5 minutos (anti-spam)
- Mensaje de bienvenida + respuesta IA, nada más

---

## 3. Arquitectura Propuesta

```
┌─────────────────────┐
│   Panel Admin Web    │
│  (Pestaña WhatsApp)  │
│                      │
│  • Botón Conectar QR │
│  • Estado del bot    │
│  • Botón Desconectar │
└──────────┬───────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────────┐
│         Backend (NestJS)            │
│                                     │
│  WhatsappModule                     │
│  ├── whatsapp.controller.ts         │
│  │   • GET /status                  │
│  │   • GET /qr                      │
│  │   • POST /connect (iniciar bot)  │
│  │   • POST /disconnect             │
│  │                                  │
│  ├── whatsapp.service.ts            │
│  │   • initWhatsapp()               │
│  │   • Filtro: solo mensajes 1-a-1  │
│  │   • Rate limit: 1 msg/5min/num   │
│  │   • Bienvenida + respuesta IA    │
│  │   • Guardar auth en DB           │
│  │                                  │
│  └── whatsapp-auth.service.ts       │
│      • saveAuthState(state) → DB    │
│      • loadAuthState() → DB         │
│      • clearAuthState()             │
│                                     │
│  Base de Datos (Neon PostgreSQL)    │
│  └── Tabla: WhatsappSession         │
│      • id, sessionData (JSON), date │
└─────────────────────────────────────┘
```

---

## 4. Diferencias Clave vs. Implementación Anterior

| Aspecto | Antes (falló) | Ahora (propuesto) |
|---------|---------------|-------------------|
| Inicio del bot | Automático al arrancar servidor | **Manual** — solo con botón del admin |
| Filtro de mensajes | Ninguno (respondía a todo) | Solo mensajes directos (`@s.whatsapp.net`) |
| Anti-spam | Ninguno | Rate limit: 1 respuesta por número cada 5 min |
| Almacenamiento de sesión | Sistema de archivos (se borra) | **Base de datos PostgreSQL** (persistente) |
| Manejo de errores | Mínimo | Try-catch completo con logs y reintentos |
| Reconexión | Infinita (loop de reconexión) | Máximo 3 intentos, luego se detiene |
| Dependencia del servidor | Obligatoria (se iniciaba solo) | **Opcional** — el backend funciona perfecto sin el bot |

---

## 5. Plan de Implementación Paso a Paso

### Fase 1: Base de Datos (15 min)
1. Agregar modelo `WhatsappSession` al schema de Prisma
2. Ejecutar migración (`prisma db push`)

### Fase 2: Servicio de Autenticación Persistente (30 min)
1. Crear `whatsapp-auth.service.ts`
2. Implementar `usePostgresAuthState()` — adaptador custom que guarda/lee las credenciales de Baileys desde PostgreSQL en vez del sistema de archivos
3. Probar que las credenciales se guardan y se leen correctamente

### Fase 3: Servicio Principal del Bot (45 min)
1. Crear `whatsapp.service.ts` con las siguientes protecciones:
   - **NO auto-iniciar** al arrancar el backend
   - Filtro de grupos: ignorar `@g.us` y `status@broadcast`
   - Rate limit por número (Map en memoria)
   - Máximo 3 reintentos de reconexión
   - Timeout de 30 segundos para respuestas IA
2. Integrar con `ChatService` existente para las respuestas IA

### Fase 4: Controller y Endpoints (15 min)
1. Crear `whatsapp.controller.ts` con endpoints:
   - `GET /api/whatsapp/status` — ¿Está conectado?
   - `GET /api/whatsapp/qr` — Obtener imagen QR
   - `POST /api/whatsapp/connect` — Iniciar el bot manualmente
   - `POST /api/whatsapp/disconnect` — Cerrar sesión

### Fase 5: Panel Admin (30 min)
1. Agregar pestaña "WhatsApp Bot" al `AdminDashboard.tsx`
2. Botón "Conectar" que llama a `POST /connect` y luego muestra el QR
3. Indicador de estado (Conectado/Desconectado)
4. Botón "Desconectar" que cierra la sesión

### Fase 6: Pruebas (30 min)
1. Probar localmente con `npm run start:dev`
2. Enviar mensaje desde un teléfono → verificar que responde
3. Enviar mensaje desde un grupo → verificar que NO responde
4. Enviar 5 mensajes seguidos → verificar que solo responde 1 (rate limit)
5. Reiniciar el backend → verificar que la sesión se mantiene (auth en DB)

### Fase 7: Despliegue (15 min)
1. Commit y push a GitHub
2. Verificar deploy en Render
3. Probar en producción

**Tiempo total estimado: ~3 horas**

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| WhatsApp banea el número | Media (si se abusa) | Usar número dedicado, rate limit estricto, no enviar spam |
| Baileys deja de funcionar por actualización de WA | Baja (se mantiene activo) | La librería tiene una comunidad activa que la actualiza |
| El bot consume mucha RAM | Baja (con las protecciones) | Filtros + rate limit mantienen el consumo bajo ~150MB |
| Se pierde la sesión en Render | Nula (con auth en DB) | Las credenciales viven en PostgreSQL, no en archivos |

---

## 7. Qué NO Hace Este Bot

Para mantener las expectativas claras:
- ❌ No envía mensajes masivos (spam)
- ❌ No responde en grupos
- ❌ No tiene interfaz de chat completa
- ❌ No garantiza 100% uptime (Render gratis duerme después de 15 min de inactividad)
- ✅ Responde automáticamente a mensajes directos con IA
- ✅ Envía mensaje de bienvenida al primer contacto
- ✅ Mantiene la sesión entre reinicios del servidor

---

## 8. Dependencias a Instalar

```bash
npm install @whiskeysockets/baileys qrcode
npm install -D @types/qrcode
```

> **Nota:** NO se necesita `pino` como dependencia separada. Baileys lo trae internamente.

---

## 9. Cuándo Implementar

**Recomendación:** Implementar este módulo solo cuando:
1. ✅ El resto del sistema esté funcionando establemente en producción
2. ✅ Tengas un número de teléfono dedicado para el bot
3. ✅ Hayas decidido si quieres invertir en Render pagado ($7/mes) o prefieres la solución gratuita con auth en DB

---

*Este documento queda como referencia para implementar el bot de WhatsApp cuando el usuario lo decida.*
