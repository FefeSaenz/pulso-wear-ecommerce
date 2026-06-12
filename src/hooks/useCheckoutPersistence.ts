import { useEffect } from 'react';
import { CHECKOUT_DRAFT_KEY } from '@/src/constants/storage';

const TTL = 30 * 60 * 1000; // 30 minutos

export const useCheckoutPersistence = (formData: any, setFormData: (data: any) => void) => {
    // Cargar datos al iniciar
    useEffect(() => {
        const saved = localStorage.getItem(CHECKOUT_DRAFT_KEY);
        if (saved) {
            try {
                const { data, timestamp } = JSON.parse(saved);
                if (Date.now() - timestamp < TTL) {
                    setFormData((prev: any) => ({ ...prev, ...data }));
                } else {
                    localStorage.removeItem(CHECKOUT_DRAFT_KEY);
                }
            } catch (error) {
                localStorage.removeItem(CHECKOUT_DRAFT_KEY);
            }
        }
    }, [setFormData]);

    // Guardar datos al cambiar
    useEffect(() => {
        const hasData = Object.values(formData).some(val => val !== '');
        if (hasData) {
            localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify({
                data: formData,
                timestamp: Date.now()
            }));
        }
    }, [formData]);

    const clearPersistence = () => localStorage.removeItem(CHECKOUT_DRAFT_KEY);

    return { clearPersistence };
};