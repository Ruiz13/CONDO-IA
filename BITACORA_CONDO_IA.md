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
* **Dashboard Principal (Resumen Financiero y Operativo):** 
  * Interfaz de monitoreo de métricas clave (Ingresos, Gastos, Pagos por Aprobar, Total Residentes).
  * **Exportación de Gráficos:** Botones de descarga (PDF/Imagen) integrados en los gráficos de "Comparativa de Ingresos vs Gastos" y "Estado de Morosidad". Esta función permite a la administración obtener capturas limpias de las estadísticas para incluirlas en los reportes o asambleas para los propietarios.
  * *Estado actual:* Interfaz conectada a datos y gráficos interactivos operativos.
* **Base de Datos (Backend):**
  * Esquema inicial de Prisma configurado.
  * Conexión exitosa a Supabase mediante Transaction Pooler.
  * *Estado actual:* Configuración de red lista e infraestructura en la nube operativa.

* **Módulo de Gestión de Gastos:**
  * **Paso 1 (Llenar Datos):** El administrador ingresa en el formulario "Registrador Gasto Mensual" los detalles de la factura: Descripción, Monto, Proveedor, N° de Factura y cualquier Observación extensa (ej. notas sobre soportes o garantías).
  * **Paso 2 (Guardar):** Oprime el botón "1. Guardar Gasto" para registrarlo en el sistema.
  * **Paso 3 (Imprimir Comprobante):** Inmediatamente después, oprime el botón "2. Imprimir Factura". Esto genera un Comprobante de Gasto en PDF, limpio, sin elementos de la interfaz, con fecha automática y 3 líneas de firmas (Preparado por, Aprobado por, Recibido por). Este documento se imprime para engraparlo con la factura física y tener un expediente de auditoría perfecto.
  * **Paso 4 (Emitir Recibos a Residentes):** A fin de mes, presionar el botón verde "Emitir Facturación Mensual". El sistema toma todos los gastos del mes y los divide según la alícuota de cada apartamento, generando la deuda que cada residente verá en su App Móvil.

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
* **Módulo: Reportar Pago (Completado):**
  * Formulario para ingresar el Monto del pago y el Número de Referencia, ahora con funcionalidad avanzada.
  * **Flujo de Comprobantes (Buckets):** La aplicación permite al residente subir una foto de su recibo o transferencia. Esta imagen se guarda en el servidor de forma local (`uploads/`) y se almacena solo su enlace en la base de datos para mantener el sistema ligero y rápido.
  * **Lectura Inteligente con IA (OCR):** Al tomar o subir la foto, la IA (Gemini) la lee automáticamente y extrae el monto y el número de referencia para rellenar los campos sin que el usuario tenga que tipear.
  * **Conciliación Automática:** Al enviar el pago, el sistema verifica internamente si el monto ingresado coincide *exactamente* con la deuda que posee el residente en ese momento. Si es igual, el pago cambia a estado "Aprobado" automáticamente en tiempo real. De lo contrario, queda "Pendiente" para revisión del operador.

---

## 📝 Próximos Pasos (Pendientes) y Tareas Recientes
*(Esta sección se irá actualizando conforme el usuario decida el rumbo del proyecto)*
- [x] Conectar la base de datos Supabase con la App Móvil para el envío real de reportes de pago.
- [x] Implementar la pantalla del "Chat IA" en la App Móvil con estilo premium (Burbujas tipo WhatsApp, input multilínea, auto-scroll y conexión real al backend y base de datos).
- [x] Programar la lógica del Panel Administrativo para recibir, aprobar o rechazar los comprobantes enviados por los residentes (Implementado en Backend).
- [x] Corrección de Despliegue en la Nube (Vercel): Se configuró exitosamente el `Root Directory` y los comandos de construcción (`npm run build`) para la carpeta `condo-ia-admin-web`, permitiendo despliegue continuo automático.
- [x] Ajustes de Gráficos en Panel de Admin: Eliminación del botón "Descargar PDF" en la gráfica de morosidad a petición, y ajuste de "Descargar Imagen" para que baje dos versiones (Modo Claro y Modo Oscuro).
