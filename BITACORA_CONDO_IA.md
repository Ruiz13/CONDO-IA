# Bitácora del Proyecto: Condo IA

Este documento sirve como registro continuo de todas las características, módulos y configuraciones que hemos implementado en el ecosistema de **Condo IA**. Su propósito principal es servir como base para la redacción final de los Manuales de Usuario (Administrador y Propietario).

---

## 🏗️ Arquitectura del Sistema
El ecosistema de Condo IA está compuesto por tres pilares fundamentales:
1. **Base de Datos (Supabase):** Almacenamiento en la nube utilizando PostgreSQL para guardar usuarios, recibos, pagos y configuraciones.
2. **Panel Administrativo (Web):** Aplicación web construida en React (Next.js) para que la junta de condominio administre el edificio.
3. **Aplicación Móvil (App):** Aplicación construida en React Native (Expo) orientada a los residentes (propietarios) para interactuar con su condominio.

---

## 📖 Esqueleto del Manual del Administrador (Panel Web)

> [!NOTE]
> Este manual está dirigido a la junta de condominio o la empresa administradora. Se enfoca en la gestión, revisión y control operativo.

### Módulos Desarrollados hasta ahora:
* **Dashboard Principal:** 
  * Interfaz de monitoreo de métricas.
  * *Estado actual:* Interfaz visual terminada con diseño moderno y soporte para tema oscuro. A la espera de conexión con datos reales.
* **Base de Datos (Backend):**
  * Esquema inicial de Prisma configurado.
  * Conexión exitosa a Supabase mediante Transaction Pooler.
  * *Estado actual:* Configuración de red lista e infraestructura en la nube operativa.

---

## 📱 Esqueleto del Manual del Propietario (App Móvil)

> [!NOTE]
> Este manual está dirigido al residente del edificio. Su enfoque es la facilidad de uso, pagos y comunicación.

### Módulos Desarrollados hasta ahora:
* **Pantalla de Inicio (Dashboard):**
  * Tarjeta visual de "Balance Actual" (Ej: $125 - AL DÍA).
  * Cuadrícula de acciones rápidas (Chat IA, Reportar Pago, Historial, Votos).
  * Barra de navegación inferior.
  * *Estado actual:* UI premium completamente funcional en emulador web.
* **Módulo: Reportar Pago:**
  * Formulario para ingresar el Monto del pago y el Número de Referencia.
  * **Captura de Comprobantes:** Integración con la cámara del dispositivo para tomar fotos del recibo en tiempo real, o explorar la galería para subir capturas de transferencias.
  * Vista previa interactiva de la imagen adjuntada con opción para eliminarla.
  * *Estado actual:* Interfaz y permisos de hardware completos. A la espera de conexión con base de datos para subir la imagen.

---

## 📝 Próximos Pasos (Pendientes)
*(Esta sección se irá actualizando conforme el usuario decida el rumbo del proyecto)*
- [ ] Conectar la base de datos Supabase con la App Móvil para el envío real de reportes de pago.
- [ ] Implementar la pantalla del "Chat IA" en la App Móvil.
- [ ] Programar la lógica del Panel Administrativo para recibir, aprobar o rechazar los comprobantes enviados por los residentes.
