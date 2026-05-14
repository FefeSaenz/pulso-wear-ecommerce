import { useState, useEffect, useCallback } from 'react';
import { requestLoginCode, verifyLoginCode } from '@/src/api/axios';
import { toast } from 'sonner';

export const useOtpAuth = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const clearOtpData = useCallback(() => {
    localStorage.removeItem('pulso_otp_end');
    localStorage.removeItem('pulso_otp_email');
    setTimeLeft(0);
    setIsCodeSent(false);
    setOtpCode('');
  }, []);

  // Función clave: Obliga al hook a leer la verdad del localStorage
  const syncState = useCallback(() => {
    const savedEndTime = localStorage.getItem('pulso_otp_end');
    const savedEmail = localStorage.getItem('pulso_otp_email');

    if (savedEndTime && savedEmail) {
      const remaining = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);
      if (remaining > 0) {
        setEmail(savedEmail);
        setTimeLeft(remaining);
        setIsCodeSent(true);
      } else {
        clearOtpData();
      }
    } else {
      clearOtpData();
    }
  }, [clearOtpData]);

  // Sincroniza al montarse por primera vez
  useEffect(() => {
    syncState();
  }, [syncState]);

  // --- LÓGICA DEL RELOJ ---
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const sendOtp = async (targetEmail: string) => {
    setLoading(true);
    try {
      await requestLoginCode(targetEmail);
      const expirationTime = Date.now() + 120 * 1000;
      localStorage.setItem('pulso_otp_end', expirationTime.toString());
      localStorage.setItem('pulso_otp_email', targetEmail);
      
      setEmail(targetEmail);
      setTimeLeft(120);
      setIsCodeSent(true);
      setOtpCode('');
      toast.success('¡Código enviado! Revisá tu casilla.');
      return true;
    } catch (error) {
      toast.error('Error al enviar el código.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.length < 6) {
      toast.error('Ingresá el código completo.');
      return null;
    }
    setLoading(true);
    try {
      const response = await verifyLoginCode(email, otpCode);
      
      // SOLUCIÓN PARA PRUEBAS: Si el mock tira OK pero no tiene token, inventamos uno para no romper el flujo.
      const token = response?.data?.token || "token_simulado_front";
      
      clearOtpData();
      return token;
    } catch (error) {
      toast.error('Código incorrecto o vencido.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail, otpCode, setOtpCode, loading, timeLeft, 
    isCodeSent, sendOtp, verifyOtp, clearOtpData, syncState
  };
};