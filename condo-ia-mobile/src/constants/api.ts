const BASE_URL = "https://condo-ia-backend.onrender.com";

export { BASE_URL };

export const API_URL = (path: string) => {
  if (!path) return BASE_URL;
  return `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
};
