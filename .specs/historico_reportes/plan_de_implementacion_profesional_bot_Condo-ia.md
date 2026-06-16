# Plan de Implementación Profesional Bot Condo-IA

Migraremos el código base de prueba (`test recepcionista`) a la carpeta oficial del proyecto `condo-ia`, estableciendo una arquitectura escalable, mantenible y profesional basada en capas (rutas, controladores y servicios) como un Microservicio Independiente.

## Estrategia Final Aprobada

1.  **Carpeta Independiente**: Se mantendrá como una carpeta separada (`condo-ia-whatsapp-bot`) (Microservicio). Esto es la práctica estándar en la industria para bots y webhooks, ya que aísla los recursos y evita que los picos de mensajes de WhatsApp saturen el sistema principal de los condominios (`condo-ia-backend`).
2.  **Base de Datos**: Se conectará el bot a la misma base de datos PostgreSQL de Condo-IA. Crearemos una tabla específica para el historial de los clientes de ventas. Esto permitirá que la IA de Gemini (actuando como vendedor) tenga un contexto persistente, humano y persuasivo, recordando interacciones pasadas.

## Cambios Propuestos

### 1. Nueva Estructura del Proyecto
Crearemos un nuevo directorio: `condo-ia/condo-ia-whatsapp-bot` con la siguiente estructura profesional:

```text
condo-ia-whatsapp-bot/
├── .env                  # Variables de entorno y URL de la Base de Datos
├── package.json          
└── src/
    ├── index.js          # Punto de entrada (Express)
    ├── controllers/
    │   └── webhook.controller.js 
    ├── routes/
    │   └── webhook.routes.js     
    ├── services/
    │   ├── ai.service.js         # Lógica de Gemini (Vendedor)
    │   ├── whatsapp.service.js   # Lógica de Meta WhatsApp API
    │   └── db.service.js         # Conexión a la DB para guardar el historial realista
    └── utils/
        └── prompts.js            # Prompt humano y vendedor de CONDO-IA
```

### 2. Archivos Clave y Funcionalidades
*   **Integración con BD**: Usaremos Prisma o consultas directas para guardar los `roles` (user/model) y `parts` (text) del historial de chat.
*   **Prompt Vendedor**: Incorporar las 10 funciones exclusivas de Condo-IA en `utils/prompts.js`.

## Próximos Pasos (Ejecución)
1. Crear la carpeta `condo-ia-whatsapp-bot` e inicializar el proyecto Node.
2. Configurar la estructura de carpetas y dependencias necesarias (Express, Gemini, Axios, Base de Datos).
3. Migrar el código del webhook de Meta.
4. Implementar la persistencia del historial en la Base de Datos.
5. Realizar pruebas enviando mensajes simulados.
