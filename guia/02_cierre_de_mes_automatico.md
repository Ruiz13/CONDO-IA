# Cierre de Mes y Facturación Automática

El sistema **Condo IA** está diseñado para facilitar la gestión financiera de los condominios, reduciendo la carga de trabajo manual del administrador.

## ¿Cómo funciona el Cierre Automático?
El día **1 de cada mes a las 00:00 AM**, el sistema "Cerebro Financiero" de Condo IA ejecuta un escaneo general (CRON Job) en todos los edificios registrados:

1. **Recolección de Gastos:** Identifica todos los gastos que hayan sido registrados por el administrador en el mes anterior y que aún no se hayan facturado (`isBilled = false`).
2. **Cálculo de Deuda:** Suma el total de esos gastos. Luego, toma la **alícuota (%)** de cada apartamento y calcula exactamente cuánto debe pagar cada residente.
3. **Generación de Facturas:** Crea un recibo en formato **PDF** con el membrete del edificio, logo, detalles de gastos, número de unidad y fecha.
4. **Envío por Email:** Se conecta a través de un servidor de correos seguro y envía el PDF adjunto al correo electrónico del propietario de cada apartamento automáticamente.
5. **Cierre de Ciclo:** Marca esos gastos como "Ya Facturados" para que no vuelvan a cobrarse en el siguiente mes.

## Acción Requerida por el Administrador
La maravilla de este sistema es que **no necesitas hacer clic en ningún botón de "Cierre"**. 

Tu única responsabilidad durante el mes es:
- Ir a la pestaña **Finanzas**.
- Registrar cada gasto en la sección **Registrar Gasto Mensual** conforme vayan sucediendo (pago de conserje, reparaciones, luz, etc.).
- ¡Listo! Deja que Condo IA haga la magia el día 1 del siguiente mes.

## Emisión Manual de Recibos
Si por alguna razón necesitas generar la facturación **antes** de fin de mes, o hubo un error y necesitas correr el proceso manualmente:
1. Asegúrate de haber registrado los gastos.
2. Ve a la pestaña **Finanzas**.
3. Haz clic en el botón verde **"Emitir Facturación Mensual"**.
Esto hará exactamente el mismo proceso automático, de inmediato, enviando los correos y cerrando los gastos actuales.
