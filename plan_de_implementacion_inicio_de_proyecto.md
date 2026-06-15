# Plan de Implementación Inicio de Proyecto

Migraremos el código base de prueba (`test recepcionista`) a la carpeta oficial del proyecto `condo-ia`, estableciendo una arquitectura escalable, mantenible y profesional basada en capas (rutas, controladores y servicios).

## Preguntas Abiertas

1. **Ubicación del Bot**: Propongo crear una carpeta independiente llamada `condo-ia-whatsapp-bot` dentro de tu directorio `condo-ia` para tratarlo como un microservicio separado. ¿Te parece bien, o prefieres que lo integremos dentro del código existente en `condo-ia-backend`?
2. **Memoria del Chat**: Actualmente el bot guarda el historial del chat en la memoria temporal del servidor. Para esta implementación profesional, ¿mantenemos la memoria temporal o tienes planeado conectarlo a la base de datos de Condo-IA más adelante? (Por ahora lo configuraré listo para que sea fácil cambiar a una base de datos luego).

## Cambios Propuestos

### 1. Nueva Estructura del Proyecto
Crearemos un nuevo directorio: `condo-ia/condo-ia-whatsapp-bot` con la siguiente estructura profesional:

```text
condo-ia-whatsapp-bot/
├── .env                  
├── .env.example          
├── .gitignore            
├── package.json          
└── src/
    ├── index.js          
    ├── config/
    │   └── env.js        
    ├── controllers/
    │   └── webhook.controller.js 
    ├── routes/
    │   └── webhook.routes.js     
    ├── services/
    │   ├── ai.service.js         
    └── whatsapp.service.js   
    └── utils/
        └── prompts.js            
```
