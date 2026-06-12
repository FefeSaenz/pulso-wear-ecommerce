import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '@/src/types/product.types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Price from './Price';
import api from '@/src/api/axios'; 
import { useAuth } from '@/src/context/AuthContext';
import { useOtpAuth } from '@/src/hooks/useOtpAuth';
import { useCheckoutPersistence } from '@/src/hooks/useCheckoutPersistence';
import { isValidEmail, isValidName, isValidDNI, isValidPhone, isValidZipCode, isValidAddress, isValidCity } from '@/src/utils/validators';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onComplete: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, onComplete }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  
  const { 
    otpCode, setOtpCode, loading: otpLoading, timeLeft, cooldown, sendOtp, verifyOtp, isCodeSent, syncState, email: otpEmail, clearOtpData
  } = useOtpAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null); // ESTADO DE ERROR LOCAL
  
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Pickup'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Transferencia');
  
  const [formData, setFormData] = useState({
    email: '', name: '', dni: '', phone: '', address: '', city: '', zip: '',
  });

  // Conectamos la persistencia al estado del formulario
  const { clearPersistence } = useCheckoutPersistence(formData, setFormData);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = (paymentMethod === 'Efectivo' || paymentMethod === 'Transferencia') ? subtotal * 0.10 : 0;
  const total = subtotal - discount;

  useEffect(() => {
    if (step === 3 && cart.length > 0) {
      setStep(2);
    }
  }, [total]);

  useEffect(() => {
    if (isOpen) {
      syncState(); 
      if (isCodeSent && !isAuthenticated && !formData.name) setStep(1);
      if (isAuthenticated && step === 3) setStep(2);
    } else {
      setErrors({});
      setCheckoutError(null); // Limpiamos error al cerrar
    }
  }, [isOpen, syncState, isCodeSent, isAuthenticated, formData.name, step]);

  useEffect(() => {
    if (isOpen && !formData.email) {
      setFormData((prev) => ({ 
        ...prev, 
        email: user ? user.email : (isCodeSent ? otpEmail : '') 
      }));
    }
  }, [isOpen, user, isCodeSent, otpEmail, formData.email]);

  if (!isOpen) return null;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    // 1. Recolectamos las validaciones
    if (!isValidName(formData.name)) newErrors.name = 'Nombre inválido';
    if (!isValidEmail(formData.email)) newErrors.email = 'Email incorrecto';
    if (!isValidDNI(formData.dni)) newErrors.dni = 'DNI debe tener 7 u 8 números';
    if (!isValidPhone(formData.phone)) newErrors.phone = 'Teléfono inválido';

    if (shippingMethod === 'Standard') {
      if (!isValidAddress(formData.address)) newErrors.address = 'Dirección incompleta';
      if (!isValidCity(formData.city)) newErrors.city = 'Ciudad necesaria';
      if (!isValidZipCode(formData.zip)) newErrors.zip = 'CP debe tener 4 números';
    }

    setErrors(newErrors);

    // 2. Analizamos los errores para armar el Toast inteligente
    const errorKeys = Object.keys(newErrors);
    
    if (errorKeys.length > 0) {
      // Buscamos si de los campos que fallaron, alguno está totalmente vacío
      const emptyFields = errorKeys.filter(key => !formData[key as keyof typeof formData]?.trim());

      if (emptyFields.length === errorKeys.length) {
        // CASO A: Todos los campos del formulario están vacíos o incompletos
        toast.error("Por favor, completá los campos requeridos.");
      } else if (emptyFields.length > 1) {
        // CASO B: Hay más de un campo vacío
        toast.error("Hay campos incompletos en el formulario.");
      } else if (emptyFields.length === 1) {
        // CASO C: Solo un campo quedó vacío de manera puntual
        const fieldLabels: Record<string, string> = {
          name: 'Nombre', email: 'Email', dni: 'DNI', phone: 'Teléfono',
          address: 'Dirección', city: 'Ciudad', zip: 'Código Postal'
        };
        toast.error(`El campo ${fieldLabels[emptyFields[0]]} está incompleto.`);
      } else {
        // CASO D: Todo está lleno, pero tiene errores de formato (no pasó los Regex)
        if (errorKeys.length === 1) {
          // Si es un solo error de formato, mostramos cuál es de forma amigable
          toast.error(`Error en el formato: ${newErrors[errorKeys[0]]}`);
        } else {
          // Varios errores de formato simultáneos
          toast.error("Error al enviar los datos. Revisá los formatos ingresados.");
        }
      }

      // Scroll automático al primer elemento con error
      const firstErrorKey = errorKeys[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      return false;
    }
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof formData) => {
    let { value } = e.target;
    if (fieldName === 'dni' || fieldName === 'zip' || fieldName === 'phone') {
      value = value.replace(/\D/g, '');
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const processCheckout = async () => {
    setLoading(true);
    setCheckoutError(null); // Limpiamos errores previos
    
    const cleanedItems = cart.map((item) => ({
        article_id: parseInt(item.id), 
        variant_id: item.variant_id, 
        quantity: item.quantity,
        price: item.price
    }));

    const newOrder: Order = {
      date: new Date().toISOString(),
      status: 'Procesando',
      customer: { email: formData.email, name: formData.name, phone: formData.phone, dni_cuit: formData.dni },
      summary: { subtotal, shipping: 0, discount, total },
      payment: { method: paymentMethod, status: 'pending' },
      shipping: {
        method: shippingMethod,
        address: shippingMethod === 'Standard' ? formData.address : 'Retiro en Local',
        city: shippingMethod === 'Standard' ? formData.city : 'Paraná',
        zip: shippingMethod === 'Standard' ? formData.zip : '3100'
      },
      items: cleanedItems
    };

    try {
      const response = await api.post('/shop/checkout/', newOrder);
      const orderIdGenerado = response.data?.data?.order_number;
      if (!orderIdGenerado) throw new Error("Backend error");
      
      const finalizedOrder = { ...newOrder, id: orderIdGenerado };
      toast.success(`¡Pedido #${orderIdGenerado} generado!`);
      clearPersistence();
      onComplete(finalizedOrder);
      setStep(1);
      setFormData({ email: '', name: '', dni: '', phone: '', address: '', city: '', zip: '' });
      onClose();
      navigate(`/orden/${orderIdGenerado}`); 
    } catch (error: any) {
      const message = error.response?.status === 400 
        ? "Datos inválidos, verificá los campos." 
        : "Servidor no responde, intentá en un momento.";
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (validateStep()) setStep(2);
    } else if (step === 2) {
      if (isAuthenticated) {
        await processCheckout();
      } else {
        if (isCodeSent) {
          setStep(3);
        } else {
          const sent = await sendOtp(formData.email);
          if (sent) setStep(3);
        }
      }
    }
  };

  const handleVerifyAndPay = async () => {
    const token = await verifyOtp();
    if (token) {
      login({ email: formData.email, token });
      await processCheckout();
    }
  };

  const getInputClass = (fieldName: string) => {
    const isError = !!errors[fieldName];
    return `w-full border-b py-3 text-[16px] md:text-xs font-bold transition-all outline-none uppercase tracking-widest bg-transparent ${isError ? 'border-red-500 text-red-600' : 'border-gray-200 text-black focus:border-black'}`;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex flex-col h-full text-black">
          <div className="flex border-b border-gray-100 shrink-0">
            {[1, 2, step === 3 ? 3 : null].filter(Boolean).map((s) => (
              <div key={s} className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-[3px] transition-colors ${step >= s! ? 'text-black' : 'text-gray-300'}`}>
                {s === 1 ? 'Información' : s === 2 ? 'Pago' : 'Verificación'}
                <div className={`h-0.5 mt-2 mx-auto w-12 transition-colors ${step >= s! ? 'bg-black' : 'bg-gray-100'}`} />
              </div>
            ))}
          </div>

          <div className="px-5 py-5 md:px-8 md:py-5 overflow-y-auto flex-1 custom-scrollbar">
            {/* JSX PARA MOSTRAR EL ERROR DE PROCESAMIENTO */}
            {checkoutError && (
              <div className="p-3 mb-4 bg-red-50 text-red-600 text-[10px] font-bold text-center border border-red-200 animate-in fade-in">
                {checkoutError}
                <button onClick={processCheckout} className="block w-full underline mt-1 cursor-pointer">Reintentar</button>
              </div>
            )}

            {step === 1 && (
              // ... (código de los inputs igual que antes)
              <div className="animate-in slide-in-from-right duration-300">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-3 text-black">Entrega</h3>
                <div className="flex space-x-4 mb-4">
                  <button onClick={() => setShippingMethod('Standard')} className={`flex-1 py-3 border text-[10px] font-black uppercase tracking-widest transition-all ${shippingMethod === 'Standard' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}>Envío a Domicilio</button>
                  <button onClick={() => setShippingMethod('Pickup')} className={`flex-1 py-3 border text-[10px] font-black uppercase tracking-widest transition-all ${shippingMethod === 'Pickup' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}>Retiro en Local</button>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <input name="email" type="email" placeholder="EMAIL" className={getInputClass('email')} onChange={(e) => handleInputChange(e, 'email')} value={formData.email} disabled={isAuthenticated || isCodeSent} />
                  <input name="name" type="text" placeholder="NOMBRE COMPLETO" className={getInputClass('name')} onChange={(e) => handleInputChange(e, 'name')} value={formData.name} />
                  <input name="dni" type="text" inputMode="numeric" placeholder="DNI / CUIT" className={getInputClass('dni')} onChange={(e) => handleInputChange(e, 'dni')} value={formData.dni} />
                  <input name="phone" type="tel" inputMode="numeric" placeholder="TELÉFONO" className={getInputClass('phone')} onChange={(e) => handleInputChange(e, 'phone')} value={formData.phone} />
                  {shippingMethod === 'Standard' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-2 md:space-y-3">
                      <input name="address" type="text" placeholder="DIRECCIÓN" className={getInputClass('address')} onChange={(e) => handleInputChange(e, 'address')} value={formData.address} />
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <input name="city" type="text" placeholder="CIUDAD" className={getInputClass('city')} onChange={(e) => handleInputChange(e, 'city')} value={formData.city} />
                        <input name="zip" type="text" inputMode="numeric" placeholder="CP" className={getInputClass('zip')} onChange={(e) => handleInputChange(e, 'zip')} value={formData.zip} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {step === 2 && (
              // ... (código pago)
              <div className="animate-in slide-in-from-right duration-300">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-3 text-black">Método de Pago</h3>
                <div className="space-y-3 mb-5">
                  {(['Efectivo', 'Transferencia', 'Tarjeta'] as const).map((method) => (
                    <label key={method} onClick={() => setPaymentMethod(method)} className={`block border p-3 cursor-pointer transition-all ${paymentMethod === method ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className={`w-3 h-3 md:w-4 md:h-4 border flex items-center justify-center shrink-0 ${paymentMethod === method ? 'border-black' : 'border-gray-300'}`}>
                          {paymentMethod === method && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest">{method}</span>
                            {(method === 'Efectivo' || method === 'Transferencia') && <span className="text-[9px] bg-black text-white px-2 py-1 font-bold uppercase tracking-widest">10% OFF</span>}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="bg-gray-50 p-4 rounded-sm space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest"><span>Subtotal</span><Price amount={subtotal} /></div>
                  {discount > 0 && <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase tracking-widest"><span>Descuento</span><span>-<Price amount={discount} /></span></div>}
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest pt-2 border-t border-gray-200 mt-1 text-black"><span>Total a pagar</span><Price amount={total} /></div>
                </div>
              </div>
            )}

            {step === 3 && (
              // ... (código verificación)
               <div className="animate-in slide-in-from-right duration-300 flex flex-col items-center py-4">
                <i className="fa-solid fa-shield-check text-4xl text-black mb-4"></i>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-black mb-1">Seguridad</h3>
                
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center mb-6">
                  Enviamos un pin a <span className="text-black">{formData.email}</span><br />
                  <span className="text-gray-400 text-[8px] block mt-1">VÁLIDO POR 10 MINUTOS</span>
                </p>
                
                <input type="text" placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} maxLength={6} className="w-full max-w-[200px] border-b border-gray-200 py-4 text-3xl font-black text-black focus:border-black outline-none tracking-[12px] placeholder:text-gray-200 transition-colors bg-transparent text-center mb-2" />
                
                {/* Muestro expiración siempre, y manejar el botón de reenvío con el cooldown */}
                <div className="flex flex-col items-center mb-6">
                  {cooldown > 0 ? (
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      ¿No lo recibiste? Reenviar en {formatTime(cooldown)}
                    </p>
                  ) : (
                    <button type="button" onClick={() => sendOtp(formData.email)} className="text-[10px] font-black text-black underline uppercase tracking-widest hover:text-gray-500 transition-colors cursor-pointer">
                      Reenviar código
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => { clearOtpData(); setStep(1); }} className="mt-4 text-[9px] font-bold text-gray-400 underline uppercase tracking-widest hover:text-black cursor-pointer">¿Escribiste mal tu correo?</button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 mt-auto shrink-0 bg-white">
            <div className="flex space-x-4">
              {step > 1 && <button onClick={() => setStep(step - 1)} disabled={loading || otpLoading} className="px-8 border border-gray-200 text-[10px] font-black uppercase tracking-[3px] hover:bg-gray-50 text-black transition-colors disabled:opacity-50 cursor-pointer">Atrás</button>}
              <button onClick={step < 3 ? handleNext : handleVerifyAndPay} disabled={loading || otpLoading || (step === 3 && (otpCode.length < 6 || timeLeft === 0))} className="flex-1 bg-black text-white py-4 text-[11px] font-black uppercase tracking-[4px] relative flex items-center justify-center transition-all hover:bg-gray-900 active:scale-[0.98] disabled:opacity-50 cursor-pointer">
                {(loading || otpLoading) ? <i className="fa-solid fa-circle-notch fa-spin"></i> : step === 2 ? 'CONFIRMAR' : step === 3 ? 'Verificar y Pagar' : 'Continuar'}
              </button>
            </div>
          </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;