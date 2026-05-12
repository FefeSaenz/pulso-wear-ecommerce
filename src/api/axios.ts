import axios from "axios";
import { ApiResponse } from "@/src/types/api";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 8000,
});

// Interceptor: Gestión de Sesión
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pulso_token'); 
    let guestId = localStorage.getItem('pulso_guest_id');
    
    if (!guestId) {
        guestId = crypto.randomUUID();
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
    (response) => response, // Si todo sale bien, dejamos pasar la respuesta
    (error) => {
        // Si el backend nos patea porque el token venció o es inválido
        if (error.response?.status === 401) {
        console.warn("Sesión expirada. Limpiando credenciales...");
        localStorage.removeItem('pulso_token');
        localStorage.removeItem('pulso_email');
        
        // Redirige al inicio para forzar un nuevo login
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
// Envía el mail para recibir el código OTP
export const requestLoginCode = async (email: string) => {
    return await api.post("/shop/auth/", { email });
};

//Envía mail + código para recibir el Token
export const verifyLoginCode = async (email: string, code: string) => {
    return await api.post("/shop/verify/", { email, code });
};

export default api;