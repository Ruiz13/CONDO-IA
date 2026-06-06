# Guía de Operación - Acceso Inicial de Residentes

## Contexto

Cuando se crea (o "funda") un nuevo condominio en la plataforma Condo IA utilizando el proceso de carga masiva (Onboarding), el sistema genera **automáticamente** todos los apartamentos, locales comerciales y las cuentas de usuario de sus respectivos propietarios.

No es necesario registrar a los residentes uno por uno de forma manual tras la creación del edificio.

## Procedimiento de Acceso para el Residente

Una vez que el edificio ya existe en el sistema, los residentes deben seguir este proceso:

1. **Descargar la Aplicación:** El residente debe descargar e instalar la aplicación móvil (APK) de Condo IA en su dispositivo.
2. **Credenciales de Acceso:** No hay proceso de registro en la aplicación. El administrador del edificio debe proporcionar al residente sus credenciales iniciales generadas por el sistema:
   - **Correo Electrónico:** Se utiliza un formato estándar basado en su unidad y el nombre del edificio. Por ejemplo: `apto1-1@nombredeledificio.com`.
   - **Contraseña Inicial:** El sistema asigna una clave genérica a todas las unidades (usualmente `admin123` o la clave maestra asignada por la administración).
3. **Inicio de Sesión:** El residente ingresa estas credenciales en la pantalla principal de la aplicación.
4. **Cambio Obligatorio de Clave:** Por razones de seguridad, el sistema detectará que es el primer inicio de sesión y obligará al residente a cambiar su clave temporal por una clave privada y segura antes de permitirle el uso de la aplicación.

## Errores Comunes del Administrador

**Error: "El correo del propietario ya está en uso"**

Si el Administrador entra a la página web administrativa y trata de usar el formulario **"Registrar Nuevo Residente"** introduciendo el correo de un apartamento (ej. `apto1-1@...`), el sistema mostrará un error indicando que "ya existe" o "está en uso".

**¿Por qué sucede esto?**
Porque el apartamento y el correo del propietario *ya fueron creados automáticamente* durante la fundación del edificio. El formulario "Registrar Nuevo Residente" es exclusivo para agregar un apartamento **nuevo** que no existía previamente, o para reasignar un apartamento que fue borrado del sistema.

**Solución:** 
El administrador no debe intentar registrarlo de nuevo. Si un residente tiene problemas para entrar (por ejemplo, olvidó la clave temporal), el administrador simplemente debe ir a la sección de **"Restablecer Clave de Acceso"**, seleccionar al residente en la lista desplegable y asignarle una nueva clave temporal.
