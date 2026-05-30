# Reporte de Implementación: Fábrica de Clientes / Super-Admin
**Proyecto:** Condo IA
**Fecha:** 30 de Mayo de 2026
**Módulo:** Plataforma SaaS (Software as a Service)

## Descripción de la Funcionalidad
Se ha desarrollado la capacidad de Multi-Tenant masivo. El dueño del software ahora posee un panel maestro secreto que le permite comercializar el sistema a gran escala. Con un solo clic, se crea toda la infraestructura digital de un nuevo condominio, incluyendo su propio administrador, unidades habitacionales/comerciales y perfiles de usuarios.

## Cambios Técnicos Planificados y Ejecutados

### 1. El Portal Secreto (condo-ia-web)
- Se creó una ruta oculta (ej. `tusitio.com/super-admin`) que alberga el formulario de generación.
- El panel permite parametrizar: Nombre del edificio, número de pisos, número de apartamentos por piso, cantidad de locales y la cuota (alícuota) específica para los apartamentos.
- El panel hace un llamado a la nueva API de Onboarding pasando toda la parametrización matemática en tiempo real.

### 2. El Motor de Onboarding (`tenants.service.ts`)
- **Transaccionalidad Estricta:** Se usó Prisma `$transaction` para asegurar que si falla la creación de un solo apartamento, se cancela todo el proceso (Rollback), evitando "condominios a medio construir".
- **Matemática de Alícuota Adaptable:**
  1. El servidor recibe la `aptAliquot` (ej. 1.62024%).
  2. Multiplica eso por la cantidad total de apartamentos.
  3. Resta el resultado a 100.
  4. Divide el remanente exacto entre la cantidad de locales comerciales ingresados.
  5. Asigna esos porcentajes dinámicos en la base de datos a medida que va creando las entidades `Unit`.
- **Generación de Contraseñas Seguras (Hash):** Crea automáticamente usuarios con formato de correo estándar (`apto1-1@edificio.com`) con la clave predeterminada `CondoIA2026*` encriptada con Bcrypt. Al tener la propiedad `mustChangePassword = true`, el sistema nativo de la Fase 1 forzará a cada residente a cambiar su clave al entrar por primera vez.

## Beneficios Estratégicos
- **Escalabilidad Infinita:** Lo que a un programador o equipo de soporte le tomaría semanas en configurar a mano (crear bases de datos, perfiles y llaves foráneas), el dueño de Condo IA lo logra en 5 segundos.
- **Precisión Contable:** Garantiza desde el primer segundo de vida del cliente que la suma de sus unidades siempre dé 100%, evitando errores de tipeo humano en la carga de datos masiva.

---
*Este reporte ha sido generado para la bitácora personal y base de datos documental del proyecto.*
