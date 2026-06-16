# Reporte de Implementación: Motor de Facturación Inteligente
**Proyecto:** Condo IA
**Fecha:** 30 de Mayo de 2026
**Módulo:** Finanzas / Facturación

## Descripción de la Funcionalidad
Se ha desarrollado el cerebro matemático central de la aplicación. Este motor se encarga de recolectar todos los gastos registrados en el mes y generar las facturas individuales (Invoices) de cobro para cada inmueble (Apartamentos y Locales Comerciales), aplicando un riguroso esquema de "Alícuotas Relativas" para garantizar que el condominio recupere el 100% del dinero invertido.

## Cambios Técnicos Planificados y Ejecutados

### 1. Evolución del Modelo de Datos (`schema.prisma`)
- **Reglas de Aplicación:** Se añadió el campo `appliesTo` a la tabla de `Expense` (Gastos). Esto permite catalogar si un gasto es pagadero por todos (`ALL`) o si excluye a los locales comerciales (`APARTMENTS_ONLY`).
- Se creó el módulo `ExpensesModule` en el servidor con su servicio y controlador REST para poder guardar y leer gastos reales desde la base de datos.

### 2. Motor Algorítmico y Matemático (`invoices.service.ts`)
- **Iteración Segura:** El script `generateMonthlyInvoices` (conectado a un Cron Job para el día 3 de cada mes y al botón manual) recorre los condominios registrados.
- **Identificación de Inmuebles:** Distingue internamente entre Unidades Comerciales (`isCommercial: true`) y Residenciales (`isCommercial: false`).
- **Cálculo de Alícuota Relativa:**
  - Si el gasto es `ALL`: Locales y Apartamentos pagan su alícuota normal (`Monto * Alícuota / 100`).
  - Si el gasto es `APARTMENTS_ONLY` (Ej. Ascensor): El sistema recalcula matemáticamente el peso de los apartamentos frente al resto de apartamentos (ignorando la alícuota general de los locales). Fórmula: `(Alícuota del Apto / Suma de todas las Alícuotas de Aptos)`.
  - **Resultado:** Los locales pagan $0 por ese concepto, y los apartamentos absorben exactamente el 100% de la deuda sin dejar sobrantes ni faltantes contables.

### 3. Conexión Frontend-Backend (condo-ia-web)
- La Hoja de Cálculo Interactiva en el panel web dejó de tener datos de prueba. Ahora hace "Fetch" en tiempo real a la API `/api/expenses`.
- El botón **"+ Agregar Gasto"** lanza *prompts* de diálogo donde la junta puede definir la descripción, el costo y la regla de aplicación ("T" para Todos, "A" para solo apartamentos).
- El botón **"Ejecutar Facturación"** invoca la API para accionar el motor y crear los estados de cuenta masivos de todos los usuarios.

## Beneficios Estratégicos
- **Precisión Contable:** Se evitan los clásicos errores humanos al calcular los recibos de condominio a fin de mes en hojas de Excel.
- **Justicia Económica:** Los locales comerciales no pagarán gastos que no les corresponden, y los residentes pagarán exactamente la diferencia matemática.
- **Automatización:** Con un solo clic (o dejando que la fecha llegue sola), 51 facturas nacen estructuradas y listas para la cobranza.

---
*Este reporte ha sido generado para la bitácora personal y base de datos documental del proyecto.*
