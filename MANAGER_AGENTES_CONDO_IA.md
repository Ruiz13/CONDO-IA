# Manager y Sub-agentes - Condo IA

Fecha: 29 de mayo de 2026

## Resumen

Propuesta de organización por agentes para orquestar tareas críticas (OCR, conciliación, subida, notificaciones, revisión). Incluye responsabilidades, beneficios y una alternativa ligera.

Estructura propuesta

- Manager: orquesta tareas, asigna sub-agentes, reintenta fallos, registra auditoría y resume resultados.
- Sub-agentes: trabajadores especializados y desacoplados. Ejemplos:
  - OCR Agent: recibe imagen, devuelve texto y nivel de confianza.
  - Storage Agent: sube imágenes a almacenamiento y retorna URL.
  - Conciliation Agent: intenta emparejar pago con factura y devuelve match sugerido + confianza.
  - Notification Agent: envía push/email al usuario y admin sobre cambios de estado.
  - Review Agent: interfaz para revisión manual (aprobación/rechazo) y registro en `AuditLog`.
  - AI Assistant Agent: responde preguntas del usuario con contexto de la unidad (saldo, facturas, comprobantes).

Responsabilidades del Manager

- Recepción de trabajos (por ejemplo, nuevo comprobante reportado).
- Orquestación: llamar a Storage -> OCR -> Conciliation en secuencia o en paralelo según el flujo.
- Política de reintentos y manejo de errores.
- Enriquecimiento del resultado (añadir metadatos, grado de confianza).
- Notificar al usuario y al admin del resultado final.

Beneficios

- Paralelismo y escalabilidad de procesos pesados.
- Trazabilidad y auditoría centralizada.
- Mejora en tiempos de respuesta para procesos asíncronos.

Costes y limitaciones

- Aumenta complejidad operativa (cola, workers, supervisión).
- Requiere más pruebas y monitoreo.

Alternativa recomendada inicialmente

- Coordinador ligero: implementar cola simple (Redis/Rabbit) y workers para OCR y conciliación. Esto valida el flujo sin introducir toda la complejidad de un Manager completo.

Opciones de acción

- Opción A: Diseñar la arquitectura completa Manager + sub-agentes (diagrama y componentes). Ideal si se planea escalar.
- Opción B: Implementar coordinador ligero + 2 workers (Storage y OCR/Conciliación) y exponer endpoints para revisar resultados. Recomendada como primer paso.

Siguiente paso sugerido

- Indica si quieres que prepare el diseño (Opción A) o que implemente el coordinador ligero (Opción B).

Archivo generado automáticamente desde el proyecto Condo IA.
