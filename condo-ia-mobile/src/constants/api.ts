import { Platform } from "react-native";

// Puerto por defecto que usa el backend (ver `condo-ia-backend/src/main.ts`)
const DEFAULT_BACKEND_PORT = process.env.API_PORT ?? "3001";

// En simulador Android, `localhost` del host se mapea a 10.0.2.2
const LOCAL_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

const DEV_BASE = "https://condo-ia-backend.onrender.com";
const PROD_BASE = "https://condo-ia-backend.onrender.com";

// En modo desarrollo usamos el backend local (emulador), en producción la URL remota
export const BASE_URL =
  typeof __DEV__ !== "undefined" && __DEV__ ? DEV_BASE : PROD_BASE;

export const API_URL = (path: string) => {
  if (!path) return BASE_URL;
  return `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
};

export async function apiFetch(path: string, options?: any) {
  return fetch(API_URL(path), options);
}

// Nota: Para cambiar la URL en desarrollo, exporta la variable de entorno API_PORT
// Ejemplo (Windows PowerShell): $env:API_PORT = '3001'; npm run start
