// ============================================================
// frontend/src/services/api.js
// Configuración de Axios — todas las llamadas a la API van por aquí
// ============================================================
import axios from "axios";

const api = axios.create({
  // AGREGAMOS /api AL FINAL DE LA URL BASE
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
});

// Interceptor: agrega el token JWT a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: maneja errores de autenticación globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es un error de autenticación, limpiamos y mandamos al login
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      // Evitamos redirecciones infinitas si ya estamos en /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ============================================================
// Servicios por módulo
// ============================================================

export const authService = {
  // Ahora pegará /api + /auth/login = http://localhost:3001/api/auth/login ✅
  login: (datos) => api.post("/auth/login", datos),
  perfil: () => api.get("/auth/me"),
};

export const solicitudesService = {
  listar: () => api.get("/solicitudes"),
  obtener: (id) => api.get(`/solicitudes/${id}`),
  historial: (id) => api.get(`/solicitudes/${id}/historial`),
  crear: (datos) => api.post("/solicitudes", datos),
};

export const aprobacionesService = {
  misPendientes: () => api.get("/aprobaciones/mis-pendientes"),
  actuar: (id, datos) => api.put(`/aprobaciones/${id}`, datos),
};

export const notificacionesService = {
  listar: () => api.get("/notificaciones"),
  marcarLeida: (id) => api.put(`/notificaciones/${id}/leer`),
};

export const reportesService = {
  resumenGeneral: () => api.get("/reportes/solicitudes"),
  porDepartamento: () => api.get("/reportes/por-departamento"),
};

export default api;
