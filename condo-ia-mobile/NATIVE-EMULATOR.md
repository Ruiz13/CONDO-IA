# Ejecutar la app en emulador Android (sin Expo Go)

Objetivo: compilar e instalar la app en un emulador Android (o dispositivo) sin usar Expo Go, conectando al backend local (`condo-ia-backend`).

Requisitos:

- Android Studio + Android SDK instalado
- Emulador AVD configurado y listo
- Java/Gradle (normalmente vienen con Android Studio)
- Node.js y dependencias del proyecto instaladas

Pasos resumidos:

1. Instala dependencias

```powershell
cd c:\Users\matar\Downloads\CONDO-IA\condo-ia-mobile
npm install
```

2. Inicia y prepara el backend (si no está corriendo)

```powershell
cd c:\Users\matar\Downloads\CONDO-IA\condo-ia-backend
npm install
# Asegúrate de configurar DATABASE_URL en .env si usas una DB
npx prisma db seed
npm run start:dev
```

El backend por defecto escucha en el puerto `3001`. Cuando corras la app en el emulador Android, la app usará `http://10.0.2.2:3001` automáticamente durante desarrollo.

3. Generar un build de desarrollo nativo e instalar en el emulador

Expo ofrece dos opciones: "development client" (recomendado para desarrollo) o eject/prebuild + run.

Opción A — `expo run:android` (recomendado, construye una app nativa e instala en el emulador):

```powershell
cd c:\Users\matar\Downloads\CONDO-IA\condo-ia-mobile
npx expo prebuild --platform android   # genera carpetas nativas (solo la primera vez)
npx expo run:android
```

Esto compilará la app nativa y la instalará en el emulador. En modo desarrollo, la app usará `BASE_URL` configurado para desarrollo (10.0.2.2:3001).

Opción B — Crear un APK para instalar manualmente (más lento):

```powershell
cd c:\Users\matar\Downloads\CONDO-IA\condo-ia-mobile
npx expo prebuild --platform android
cd android
./gradlew assembleDebug    # en Windows PowerShell usa .\gradlew assembleDebug
# Resultado: app/build/outputs/apk/debug/app-debug.apk
```

4. Variables y pruebas de red

- En Android emulator, `10.0.2.2` mapea a `localhost` del host. La app en desarrollo detecta esto y usará `http://10.0.2.2:3001`.
- Si quieres exponer el backend para pruebas desde un dispositivo real, usa ngrok o similar y actualiza `src/constants/api.ts` con la URL pública (o cambia `BASE_URL` manualmente).

5. Problemas comunes

- Si la app no se conecta: revisa que el backend esté corriendo en el puerto 3001 y que no haya firewalls bloqueando.
- Si `expo run:android` falla por versiones: asegúrate de tener Android SDK y `ANDROID_HOME` (o `ANDROID_SDK_ROOT`) configurados.

6. Opcional: script útil en Windows PowerShell

```powershell
# Arranca backend y luego la app en emulador (en dos terminales separados preferiblemente):
# Terminal 1 (backend)
cd c:\Users\matar\Downloads\CONDO-IA\condo-ia-backend
npm run start:dev

# Terminal 2 (app)
cd c:\Users\matar\Downloads\CONDO-IA\condo-ia-mobile
npx expo run:android
```

Notas finales:

- El logo `CONDO-IA` ya está incluido en el repositorio; la app usa assets del proyecto.
- Si deseas, puedo automatizar la creación de una build de desarrollo y un script para exponer el backend con ngrok y actualizar `BASE_URL` automáticamente.
