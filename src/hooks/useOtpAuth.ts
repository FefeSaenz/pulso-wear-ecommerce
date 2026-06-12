import { useState, useEffect, useCallback } from 'react';
import { requestLoginCode, verifyLoginCode } from '@/src/api/axios';
import { toast } from 'sonner';

export const useOtpAuth = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const clearOtpData = useCallback(() => {
    localStorage.removeItem('pulso_otp_end');
    localStorage.removeItem('pulso_otp_email');
    localStorage.removeItem('pulso_otp_cooldown');
    setTimeLeft(0);
    setCooldown(0);
    setIsCodeSent(false);
    setOtpCode('');
  }, []);

  // Función clave: Obliga al hook a leer la verdad del localStorage
  const syncState = useCallback(() => {
    const savedEndTime = localStorage.getItem('pulso_otp_end');
    const savedEmail = localStorage.getItem('pulso_otp_email');
    const savedCooldown = localStorage.getItem('pulso_otp_cooldown');

    if (savedEndTime && savedEmail) {
      const remaining = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);
      if (remaining > 0) {
        setEmail(savedEmail);
        setTimeLeft(remaining);
        setIsCodeSent(true);

        // Recuperamos el cooldown si existe y sigue vigente
        if (savedCooldown) {
          const cooldownRemaining = Math.floor((parseInt(savedCooldown) - Date.now()) / 1000);
          if (cooldownRemaining > 0) {
            setCooldown(cooldownRemaining);
          }
        }
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
    if (timeLeft <= 0 && cooldown <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
      setCooldown((prev) => Math.max(0, prev - 1)); // Bajamos 1 segundo también al cooldown
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, cooldown]);

  const sendOtp = async (targetEmail: string) => {
    setLoading(true);
    try {
      await requestLoginCode(targetEmail);
      const expirationTime = Date.now() + 600 * 1000; // 10 minutos
      const cooldownTime = Date.now() + 60 * 1000; // 60 segundos

      localStorage.setItem('pulso_otp_end', expirationTime.toString());
      localStorage.setItem('pulso_otp_email', targetEmail);
      localStorage.setItem('pulso_otp_cooldown', cooldownTime.toString()); // Guardamos el bloqueo
      
      setEmail(targetEmail);
      setTimeLeft(600);
      setCooldown(60);
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
      const token = response?.data?.data?.token;

      if (!token) {
         throw new Error("El backend no devolvió un token válido.");
      }

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
    email, setEmail, otpCode, setOtpCode, loading, timeLeft, cooldown, isCodeSent, sendOtp, verifyOtp, clearOtpData, syncState
  };
};