# Condo IA - Mobile (Expo)

Instrucciones rápidas para desarrollo local y pruebas con el backend incluido en el repo `CONDO-IA`.

Requisitos:

- Node.js (16+)
- Expo CLI (opcional: `npm i -g expo-cli`)

Pasos para pruebas locales (backend + móvil):

1. Inicia el backend (desde `condo-ia-backend`):

```powershell
cd c:\Users\matar\Downloads\CONDO-IA\condo-ia-backend
npm install
# Configura tu DATABASE_URL en .env o como variable de entorno
# Ejecuta migraciones si es necesario (opcional): npx prisma migrate dev --name init
# Ejecuta la siembra (seed) para crear usuarios de prueba:
npx prisma db seed
# Inicia el backend en modo desarrollo:
npm run start:dev
```

2. Inicia la app móvil (desde `condo-ia-mobile`):

```powershell
cd c:\Users\matar\Downloads\CONDO-IA\condo-ia-mobile
npm install
npm run start
```

3. Configurar la URL del backend (opcional):

- La app móvil usa por defecto `BASE_URL` en `src/constants/api.ts`.
- Puedes editar ese archivo para apuntar a otro host (ej. túnel ngrok o URL de render).

Credenciales de prueba (creadas por `prisma/seed.ts`):

- Administrador: `admin@condoia.com` / `CondoIA2026*`
- Propietarios: `propietario_<unidad>@condoia.com`, contraseña: `CondoIA2026*`
  - Ejemplo: `propietario_1-1@condoia.com` / `CondoIA2026*`

Notas:

- Si tu backend corre en `localhost`, expónlo con ngrok o similar y pon la URL en `BASE_URL`.
- El seed crea unidades, usuarios y algunos datos de ejemplo.

Consulta `NATIVE-EMULATOR.md` para instrucciones detalladas sobre cómo compilar/instalar la app en un emulador Android sin usar Expo Go, incluyendo comandos y notas sobre `10.0.2.2`.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
