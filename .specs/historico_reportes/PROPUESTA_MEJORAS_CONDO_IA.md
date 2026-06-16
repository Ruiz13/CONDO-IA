# Propuesta de mejoras - Condo IA

Fecha: 29 de mayo de 2026

## Resumen

Esta nota resume mejoras funcionales, priorizadas y enfocadas en valor para propietarios, locales y administradores. Se evitan detalles técnicos; el objetivo es presentar funciones realistas que puedas adoptar.

Prioridad Alta — Impacto directo en usuarios

- Flujo de subida y seguimiento de comprobantes: subir foto (cámara o galería), ver estado (Pendiente / Aprobado / Rechazado) y recibir notificaciones cuando cambie el estado.
- OCR + conciliación automática: extraer referencia y monto del comprobante y emparejar con la factura correspondiente; si no hay match, marcar para revisión manual.
- Aprobación y auditoría desde el panel admin: botones rápidos para aprobar/rechazar, añadir comentarios, y registro visible para el propietario.
- Pago guiado en la app: mostrar la factura objetivo, sugerir monto exacto, atajos para subir comprobante o pagar desde la misma app.
- Notificaciones push y correo: avisos automáticos de vencimientos, reporte recibido y aprobación/rechazo.

Prioridad Media — Mejora de experiencia y eficiencia

- Asistente IA contextual para propietarios: respuestas sobre saldo, facturas vencidas y estado de comprobantes, con acceso a datos de la unidad.
- Resúmenes mensuales por unidad: resumen simple de gastos, pagos y próximos vencimientos.
- Filtros y búsqueda avanzada en el panel admin: por referencia, estado, unidad, fecha, y resultados exportables.
- Visor de comprobantes mejorado: zoom, rotación y recorte para revisión fácil por el admin.
- Historial de comprobantes por unidad: propietarios ven todos sus pagos y motivos de rechazo.

Prioridad Baja — Valor añadido

- Detección de comprobantes sospechosos: marcar duplicados o datos inconsistentes para revisión.
- Predicción de morosidad: alertas tempranas para unidades con riesgo de atraso.
- Reservas y pagos de áreas comunes: calendario, reservas y cobros integrados.
- Marketplace de servicios: ofrecer proveedores de mantenimiento y gestión de reservas.

Ideas IA orientadas a usuarios (realistas)

- Asistente proactivo: sugerir subir comprobante si detecta transferencia desde el banco.
- Corrección inteligente de OCR: la IA sugiere correcciones cuando el texto del comprobante es confuso.
- Respuestas frecuentes automatizadas: “¿Cuál es mi saldo?” o “¿Mi pago fue aprobado?” con datos actuales.
- Generador de comunicados: el admin escribe el asunto y la IA propone el comunicado listo para enviar.
- Sugerencias de conciliación para admins: la IA muestra el match más probable entre pagos y facturas con grado de confianza.

Beneficios clave

- Menos fricción para reportar pagos y recibir confirmación rápida.
- Transparencia para propietarios con historial y motivos.
- Reducción de trabajo administrativo por conciliación automática.
- Mejora en la comunicación con comunicados automáticos y notificaciones.

Opciones recomendadas para iniciar (elige 1 o 2)

1. Implementar OCR + conciliación automática y completar el flujo de subida de comprobantes en la app. (Mayor retorno en tiempo ahorrado).
2. Añadir aprobación en el panel admin con auditoría y notificaciones push. (Control y confianza inmediata).
3. Mejorar el Chat IA para que responda con contexto de la unidad (saldo, facturas, estado de comprobantes).

Siguientes pasos sugeridos

- Elegir 1 o 2 opciones prioritarias.
- Preparar lista de entregables por sprint (p. ej. subir comprobante -> OCR -> conciliación -> aprobación).
- Validar integraciones externas necesarias (almacenamiento de imágenes, proveedor OCR o servicio IA para correcciones).

Archivo generado automáticamente desde el proyecto Condo IA.
