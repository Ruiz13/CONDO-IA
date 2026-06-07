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

* **Módulo de Gestión de Gastos y Facturación Mensual:**
  * **Paso 1 (Registrar):** Durante todo el mes, se debe ingresar en el "Registrador Gasto Mensual" cada factura o pago realizado por el edificio (ej. conserjería, electricidad, mantenimiento de ascensores).
  * **Paso 2 (Respaldar/Auditar):** Al terminar el mes, usar los botones PDF o CSV en la tabla de "Gastos del Mes" para descargar la relación de gastos. Esto sirve como respaldo contable y garantiza la transparencia ante los vecinos.
  * **Paso 3 (Emitir Recibos):** Finalmente, presionar el botón verde "Emitir Facturación Mensual". El sistema tomará el total de los gastos registrados y lo dividirá automáticamente según la alícuota (porcentaje) de cada apartamento y local, generando la deuda o recibo individual que el residente verá en su aplicación móvil.

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
  * **Ligereza y Velocidad:** Se decidió enviar únicamente los datos textuales a la base de datos, eliminando el peso de imágenes y escaneos OCR en esta pantalla para mayor agilidad.
  * *Estado actual:* Interfaz conectada exitosamente a la base de datos (Supabase) mediante el backend en NestJS. Pagos entran con estado "PENDING".

---

## 📝 Próximos Pasos (Pendientes)
*(Esta sección se irá actualizando conforme el usuario decida el rumbo del proyecto)*
- [x] Conectar la base de datos Supabase con la App Móvil para el envío real de reportes de pago.
- [x] Implementar la pantalla del "Chat IA" en la App Móvil (Conectada a Gemini).
- [x] Programar la lógica del Panel Administrativo para recibir, aprobar o rechazar los comprobantes enviados por los residentes (Implementado en Backend).
