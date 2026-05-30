# Reporte de Implementación: Asamblea Digital (Comunicados y Votaciones)
**Proyecto:** Condo IA
**Fecha:** 30 de Mayo de 2026
**Módulo:** Comunidad / Asamblea Digital

## Descripción de la Funcionalidad
Se ha desarrollado un ecosistema completo para democratizar e informar a la comunidad del condominio. La junta directiva ahora tiene un canal oficial y unilateral para emitir avisos (evitando el ruido de grupos de WhatsApp), y un sistema de encuestas vinculantes con protección de unicidad (Un voto por apartamento) para tomar decisiones comunitarias de forma transparente.

## Cambios Técnicos Planificados y Ejecutados

### 1. Base de Datos Extendida (PostgreSQL)
Se expandió el esquema de la base de datos (`schema.prisma`) agregando cuatro entidades fundamentales:
- **`Announcement`**: Almacena el título, contenido y fecha de los avisos.
- **`Poll` y `PollOption`**: Almacena las preguntas de las asambleas virtuales y las opciones de respuesta vinculadas.
- **`Vote`**: Tabla pivot de alta seguridad. Implementa un candado a nivel de base de datos (`@@unique([pollId, userId])`) que impide matemática y estructuralmente que un mismo residente vote dos veces en la misma encuesta.

### 2. Panel Administrativo (condo-ia-web)
- **Navegación por Pestañas:** Se modernizó el panel web introduciendo un sistema de "Tabs" para alternar entre "Finanzas y Gastos" y la nueva "Asamblea Digital", sin saturar la pantalla.
- **Panel de Emisión:** Interfaz oscura y elegante que permite a la directiva escribir un título, un mensaje y enviarlo a todos los móviles.
- **Urna de Creación:** Formulario donde el administrador escribe una pregunta de debate e ingresa las opciones separadas por comas.

### 3. Aplicación Móvil (condo-ia-mobile)
Se conectó la barra de navegación inferior con dos pantallas nuevas:
- **`announcements.tsx` (Mensajes):** Un muro tipo "Feed" donde el usuario lee los avisos oficiales ordenados cronológicamente.
- **`voting.tsx` (Votar):** 
  - Muestra las asambleas activas.
  - El usuario puede tocar su opción preferida. Al votar, el servidor procesa y devuelve las estadísticas globales en tiempo real.
  - Implementa barras de progreso moradas sobre cada opción para visualizar el peso del voto y bloquea silenciosamente cualquier intento de votación doble (Fallback de seguridad en UI).

## Beneficios Estratégicos
- **Eliminación del Caos:** Centraliza la comunicación oficial fuera de aplicaciones informales como WhatsApp.
- **Transparencia Democrática:** Las encuestas no pueden ser alteradas. El sistema confía en la base de datos para asegurar resultados justos.
- **Rapidez en Decisiones:** La junta puede someter un presupuesto a votación un lunes en la noche y tener el resultado aprobado para el martes en la mañana, sin necesidad de reuniones físicas tediosas.

---
*Este reporte ha sido generado para la bitácora personal y base de datos documental del proyecto.*
