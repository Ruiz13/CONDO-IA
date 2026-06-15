# Bitácora de Implementación del Bot de WhatsApp (Ventas)

Esta bitácora registrará todos los pasos, cambios y decisiones tomadas durante la integración del bot de WhatsApp basado en la IA de Gemini para la venta del sistema CONDO-IA.

## Registro de Actividades

### 1. Planificación Inicial
*   Se evaluó el código base de prueba de la carpeta `test recepcionista`.
*   Se determinó que el bot (usando la API oficial de Meta y Gemini) debe implementarse como un **Microservicio Independiente** en la carpeta `condo-ia-whatsapp-bot` para evitar afectar el rendimiento del backend principal en NestJS.
*   Se acordó que el bot se conectará a la **misma base de datos de Condo-IA** para almacenar de forma persistente el historial de las conversaciones. Esto es fundamental para que el bot de ventas tenga "memoria" y suene realista y humano a lo largo del tiempo.

### 2. Generación de Documentación
*   Se guardó el plan inicial como `plan_de_implementacion_inicio_de_proyecto.md`.
*   Se guardó el plan aprobado y detallado como `plan_de_implementacion_profesional_bot_Condo-ia.md`.

*Pendiente: Iniciar la creación de la estructura de carpetas y código base en el siguiente paso.*

### 3. Ejecución y Desarrollo
*   **Estructura:** Se inicializó Node.js y se creó la arquitectura de carpetas (`src/controllers`, `src/routes`, `src/services`, `src/utils`, `src/config`).
*   **Base de Datos (Crítico):** Para evitar la pérdida de datos de Condo-IA (al hacer `prisma db push`), se agregó el modelo `WhatsappChatHistory` directamente al esquema del backend (`condo-ia-backend/prisma/schema.prisma`) y se empujó desde allí de forma segura.
*   **Generación de Cliente:** El bot ahora genera su cliente Prisma local apuntando al esquema actualizado para guardar permanentemente los mensajes (rol 'user' y 'model').
*   **Lógica:** Se implementó el `ai.service.js` con Google Gemini, configurado para leer los últimos 20 mensajes del historial desde la base de datos antes de generar una nueva respuesta de ventas.

### 4. Finalización (Versión Inicial Meta API)
*   El servidor se inicializó correctamente en el puerto 3000 con los Endpoints listos para recibir los webhooks de Meta.

### 5. Refactorización Arquitectónica (API Gateway Genérico)
*   Se descartó el uso de Meta Cloud API directo para evitar acoplamientos técnicos, y se migró a un modelo genérico de proveedor de terceros (API Gateway).

### 6. Migración Definitiva a Meta Cloud API (Oficial)
*   Tras evaluar costos y conveniencia (1.000 conversaciones gratuitas al mes), el cliente decidió migrar nativamente a la API oficial de Meta.
*   **Modificaciones:**
    - `.env`: Se restauraron `GRAPH_API_TOKEN` y `PHONE_NUMBER_ID`.
    - `whatsapp.service.js`: Se implementó el POST a `graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages` cumpliendo con el JSON estricto (`messaging_product: "whatsapp"`).
    - `webhook.controller.js`: Se reimplementó la verificación `hub.verify_token` obligatoria de Meta y el parseo del JSON profundamente anidado (`entry[0].changes[0].value.messages[0]`).
*   La IA (Gemini) sigue intacta, operando como cerebro del bot. El código final está ultra optimizado para Node.js puro y preparado para un despliegue en Render.com.
