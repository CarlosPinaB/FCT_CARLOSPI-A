/**
 * Configuración del Frontend
 * Detecta automáticamente el entorno y usa la URL correcta del backend
 */

// Detectar si estamos en desarrollo o producción
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.includes("localhost");

// URLs según el entorno
const API_CONFIG = {
  development: {
    BASE_URL: "http://localhost:8000/api",
    BACKEND_URL: "http://localhost:8000",
  },
  production: {
    BASE_URL: "https://actividades-backend.onrender.com/api",
    BACKEND_URL: "https://actividades-backend.onrender.com",
  },
};

// Configuración actual según el entorno
const currentConfig = isDevelopment
  ? API_CONFIG.development
  : API_CONFIG.production;

// Exportar configuración
window.APP_CONFIG = {
  API_BASE_URL: currentConfig.BASE_URL,
  BACKEND_URL: currentConfig.BACKEND_URL,
  IS_DEVELOPMENT: isDevelopment,
  APP_NAME: "Sistema de Actividades Extraescolares",
  VERSION: "1.0.0",
};

console.log(
  `🌍 Entorno detectado: ${isDevelopment ? "DESARROLLO" : "PRODUCCIÓN"}`
);
console.log(`🔗 API URL: ${window.APP_CONFIG.API_BASE_URL}`);
