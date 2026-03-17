import axios from "axios";
import { ApiResponse } from "../types/api";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 8000,
});

export const getFrontData = async (): Promise<ApiResponse['data']> => {
    
    const response = await api.get<ApiResponse>("/");
    return response.data.data;
};

export default api;