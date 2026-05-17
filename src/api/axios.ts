import axios from "axios";
import { ApiResponse } from "@/src/types/api";

// Helper: Generador de UUID seguro para todos los entornos
const generateSafeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID(); // <-- PRODUCCIÓN (Vercel) / Localhost
  }
  // <-- CELULAR / Red Local (HTTP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 8000,
});

// Interceptor: Gestión de Sesión
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pulso_token'); 
    let guestId = localStorage.getItem('pulso_guest_id');
    
    if (!guestId) {
        // Usamos la función segura en vez del crypto directo
        guestId = generateSafeUUID();
        localStorage.setItem('pulso_guest_id', guestId);
    }

    if (!config.headers) config.headers = {} as any;

    config.headers['X-Guest-ID'] = guestId;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

// INTERCEPTOR DE RESPUESTAS (Manejo de errores)
api.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response?.status === 401) {
        console.warn("Sesión expirada. Limpiando credenciales...");
        localStorage.removeItem('pulso_token');
        localStorage.removeItem('pulso_email');
        
        window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Servicios de Tienda
export const getFrontData = async (): Promise<ApiResponse['data']> => {
    const response = await api.get<ApiResponse>("/shop/page/");
    return response.data.data;
};

// Flujo de Autenticación
export const requestLoginCode = async (email: string) => {
    return await api.post("/shop/auth/", { email });
};

export const verifyLoginCode = async (email: string, code: string) => {
    return await api.post("/shop/verify/", { email, code });
};

export default api;