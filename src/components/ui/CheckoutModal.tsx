import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '@/src/types/product.types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Price from './Price';
import api from '@/src/api/axios'; 
import { useAuth } from '@/src/context/AuthContext';
import { useOtpAuth } from '@/src/hooks/useOtpAuth'; 

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onComplete: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, onComplete }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth(); // Traemos al usuario logueado y las funciones
  
  // Estados para el OTP (Paso Fantasma)
  const { 
    otpCode, setOtpCode, loading: otpLoading, timeLeft, 
    sendOtp, verifyOtp, isCodeSent, syncState, email: otpEmail, clearOtpData
  } = useOtpAuth(); // Agregué clearOtpData para el ticket de QA

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Nuevos estados de Negocio
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Pickup'>('Standard');
  // Nota: Asegurarse de que 'Efectivo' esté agregado en product.types.ts en payment.method
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Transferencia');
  
  const [formData, setFormData] = useState({
    email: '', name: '', dni: '', phone: '', address: '', city: '', zip: '',
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Descuento del 10% si es Efectivo o Transferencia
  const discount = (paymentMethod === 'Efectivo' || paymentMethod === 'Transferencia') ? subtotal * 0.10 : 0;
  const total = subtotal - discount;

  // EFECTO DE QA (TICKET 2): Si el carrito cambia (el total) mientras estaba en el Paso 3, 
  // lo devolvemos al Paso 2 para que dé consentimiento explícito del nuevo total.
  useEffect(() => {
    if (step === 3 && cart.length > 0) {
      setStep(2);
    }
  }, [total]); // Vigila si el total cambia

  // EFECTO: Sincronización maestra al abrir o cerrar
  useEffect(() => {
    if (isOpen) {
      syncState(); 
      
      // REGLA 1: Si hay un código volando pero nunca llenó sus datos, lo dejamos en paso 1
      if (isCodeSent && !isAuthenticated && !formData.name) {
        setStep(1);
      }
      
      // REGLA 2 (TU BUG): Si estaba trabado en el Paso 3 (OTP) pero ahora ya está logueado, lo devolvemos al Paso 2
      if (isAuthenticated && step === 3) {
        setStep(2);
      }
      
    } else {
      // Dejamos que los datos vivan como borrador por si cerró la ventana por error.
      setErrors([]);
    }
  }, [isOpen, syncState, isCodeSent, isAuthenticated, formData.name, step]);

  // EFECTO: Pre-llenar el email (Usuario o Código Pendiente)
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
    const newErrors: string[] = [];
    if (!formData.name.trim()) newErrors.push('name');
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.push('email');
    if (!formData.phone.trim()) newErrors.push('phone');
    if (!formData.dni.trim()) newErrors.push('dni');

    // Validamos dirección SOLO si elige Envío a Domicilio
    if (shippingMethod === 'Standard') {
      if (!formData.address.trim()) newErrors.push('address');
      if (!formData.city.trim()) newErrors.push('city');
      if (!formData.zip.trim()) newErrors.push('zip');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof formData) => {
    let { value } = e.target;
    
    // FIX NUMÉRICO: Si el campo es DNI, CP (zip) o Teléfono, eliminamos todo lo que no sea número
    if (fieldName === 'dni' || fieldName === 'zip' || fieldName === 'phone') {
      value = value.replace(/\D/g, '');
    }

    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    if (errors.includes(fieldName)) {
      setErrors((prevErrors) => prevErrors.filter((error) => error !== fieldName));
    }
  };

  // Función aislada para procesar la compra (se usa directo si está logueado, o después del OTP si no lo está)
  const processCheckout = async () => {
    setLoading(true);
    
    // Mapeamos el carrito y le extirpamos la propiedad 'variants' a cada producto
    const cleanedItems = cart.map((item) => {
      return {
        article_id: parseInt(item.id), 
        variant_id: item.variant_id, 
        quantity: item.quantity,
        price: item.price
      };
    });

    const newOrder: Order = {
      date: new Date().toISOString(),
      status: 'Procesando',
      customer: {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        dni_cuit: formData.dni // Mapeado
      },
      summary: {
        subtotal: subtotal,
        shipping: 0, // Acá en un futuro le sumás el costo del correo si hace falta
        discount: discount,
        total: total
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      shipping: {
        method: shippingMethod,
        address: shippingMethod === 'Standard' ? formData.address : 'Retiro en Local',
        city: shippingMethod === 'Standard' ? formData.city : 'Paraná',
        zip: shippingMethod === 'Standard' ? formData.zip : '3100'
      },
      items: cleanedItems
    };

    try {
      // LO ENVIAMOS AVISANDO QUE EL FORMATO ES JSON
      const response = await api.post('/shop/checkout/', newOrder);
      
      // Usamos el ID real que devuelve tu compañero desde el Backend
      const orderIdGenerado = response.data?.id || `TEMP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Creamos una copia de la orden con el ID final para el Contexto
      const finalizedOrder = { ...newOrder, id: orderIdGenerado };

      toast.success(`¡Pedido #${orderIdGenerado} generado con éxito!`);
      
      // ESTO ES CLAVE: Le pasamos la orden finalizada al contexto
      onComplete(finalizedOrder); 
      
      // Limpiamos todo al completar
      setStep(1);
      setFormData({ email: '', name: '', dni: '', phone: '', address: '', city: '', zip: '' });
      onClose();
      navigate(`/orden/${orderIdGenerado}`); 
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      toast.error("Hubo un error al procesar tu pedido. Por favor, intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setErrors([]);

    if (step === 1) {
      if (validateStep()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (isAuthenticated) {
        // Si ya está logueado, procesa la compra directamente
        await processCheckout();
      } else {
        if (isCodeSent) {
          // Si ya se mandó el código, avanzamos directo al paso 3 sin reenviar
          setStep(3);
        } else {
          // Si no está logueado y no hay código, mandamos código y abrimos el paso 3 fantasma
          const sent = await sendOtp(formData.email);
          if (sent) setStep(3);
        }
      }
    }
  };

  // Función exclusiva para el Paso 3 (Verificar e Iniciar Compra)
  const handleVerifyAndPay = async () => {
    const token = await verifyOtp();
    if (token) {
      // Logueamos al usuario globalmente en la app
      login({ email: formData.email, token });
      
      // Disparamos la orden
      await processCheckout();
    }
  };

  const getInputClass = (fieldName: string) => {
    // FIX IOS ZOOM: Cambiamos text-xs por text-[16px] md:text-xs para evitar el auto-zoom en iPhone
    const baseClass = "w-full border-b py-3 text-[16px] md:text-xs font-bold text-black focus:border-black outline-none uppercase tracking-widest placeholder:text-gray-300 transition-colors bg-transparent";
    const errorClass = errors.includes(fieldName) ? "border-red-500" : "border-gray-200";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* FIX DESKTOP CHICO (Refactored): Eliminamos max-h-[85vh] y forzamos h-full (h-screen si el padre es full) para usar todo el aire disponible arriba y abajo */}
      <div className="flex flex-col h-full text-black">
          {/* HEADER FIXO: Paso a paso */}
          <div className="flex border-b border-gray-100 shrink-0">
            {/* Renderizado dinámico de pasos para incluir el Paso 3 solo si es necesario */}
            {[1, 2, step === 3 ? 3 : null].filter(Boolean).map((s) => (
              <div key={s} className={`flex-1 py-3 md:py-3 text-center text-[10px] font-black uppercase tracking-[3px] transition-colors ${step >= s! ? 'text-black' : 'text-gray-300'}`}>
                {s === 1 ? 'Información' : s === 2 ? 'Pago' : 'Verificación'}
                <div className={`h-0.5 mt-2 mx-auto w-12 transition-colors ${step >= s! ? 'bg-black' : 'bg-gray-100'}`} />
              </div>
            ))}
          </div>

          {/* CONTENIDO SCROLLEABLE INDEPENDIENTE: Reducimos padding vertical en desktop (py-5) y micro-comprimimos spacing para asegurar Above the Fold en 720p */}
          <div className="px-5 py-5 md:px-8 md:py-5 overflow-y-auto flex-1 custom-scrollbar">
            {/* PASO 1: ENVÍO */}
            {step === 1 && (
              <div className="animate-in slide-in-from-right duration-300">
                {/* MICRO-COMPRESIÓN: mb-4 a mb-3 y texto text-lg */}
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-3 text-black">Entrega</h3>
                
                {/* SELECTOR DE ENVÍO VS RETIRO (Micro-compresión mb-4) */}
                <div className="flex space-x-4 mb-4">
                  <button onClick={() => setShippingMethod('Standard')} className={`flex-1 py-3 md:py-3 border text-[10px] font-black uppercase tracking-widest transition-all ${shippingMethod === 'Standard' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}>Envío a Domicilio</button>
                  <button onClick={() => setShippingMethod('Pickup')} className={`flex-1 py-3 md:py-3 border text-[10px] font-black uppercase tracking-widest transition-all ${shippingMethod === 'Pickup' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}>Retiro en Local</button>
                </div>

                {/* MICRO-COMPRESIÓN FORM: space-y-2 md:space-y-3 */}
                <div className="space-y-2 md:space-y-3">
                  <input 
                    type="email" 
                    placeholder="EMAIL" 
                    className={getInputClass('email')} 
                    onChange={(e) => handleInputChange(e, 'email')} 
                    value={formData.email} 
                    disabled={isAuthenticated || isCodeSent} // Bloqueamos si está logueado O si ya hay un OTP en curso
                  />
                  
                  {/* RESTRUCTURACIÓN A 1 COLUMNA PARA MOBILE */}
                  <input type="text" placeholder="NOMBRE COMPLETO" className={getInputClass('name')} onChange={(e) => handleInputChange(e, 'name')} value={formData.name} />
                  
                  <input type="text" inputMode="numeric" placeholder="DNI / CUIT" className={getInputClass('dni')} onChange={(e) => handleInputChange(e, 'dni')} value={formData.dni} />
                  
                  <input type="tel" inputMode="numeric" placeholder="TELÉFONO (Para WhatsApp)" className={getInputClass('phone')} onChange={(e) => handleInputChange(e, 'phone')} value={formData.phone} />
                  
                  {/* ESTOS CAMPOS SOLO APARECEN SI ELIGE ENVÍO */}
                  {shippingMethod === 'Standard' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-2 md:space-y-3">
                      <input type="text" placeholder="DIRECCIÓN Y NÚMERO" className={getInputClass('address')} onChange={(e) => handleInputChange(e, 'address')} value={formData.address} />
                      
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <input type="text" placeholder="CIUDAD" className={getInputClass('city')} onChange={(e) => handleInputChange(e, 'city')} value={formData.city} />
                        <input type="text" inputMode="numeric" placeholder="CP" className={getInputClass('zip')} onChange={(e) => handleInputChange(e, 'zip')} value={formData.zip} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASO 2: PAGO */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right duration-300">
                {/* MICRO-COMPRESIÓN: mb-4 a mb-3 y texto text-lg */}
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-3 text-black">Método de Pago</h3>
                
                {/* COMPRESIÓN VERTICAL: space-y-3 y mb-5 (Sigue igual para asegurar Above the Fold) */}
                <div className="space-y-3 mb-5">
                  {/* Opcion 1: Efectivo */}
                  <label onClick={() => setPaymentMethod('Efectivo')} className={`block border p-3 cursor-pointer transition-all ${paymentMethod === 'Efectivo' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className={`w-3 h-3 md:w-4 md:h-4 border flex items-center justify-center shrink-0 ${paymentMethod === 'Efectivo' ? 'border-black' : 'border-gray-300'}`}>
                        {paymentMethod === 'Efectivo' && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest">Efectivo</span>
                          <span className="text-[9px] bg-black text-white px-2 py-1 font-bold uppercase tracking-widest">10% OFF</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Abonás en el local al retirar tu pedido.</p>
                      </div>
                    </div>
                  </label>

                  {/* Opcion 2: Transferencia */}
                  <label onClick={() => setPaymentMethod('Transferencia')} className={`block border p-3 cursor-pointer transition-all ${paymentMethod === 'Transferencia' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className={`w-3 h-3 md:w-4 md:h-4 border flex items-center justify-center shrink-0 ${paymentMethod === 'Transferencia' ? 'border-black' : 'border-gray-300'}`}>
                        {paymentMethod === 'Transferencia' && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest">Transferencia</span>
                          <span className="text-[9px] bg-black text-white px-2 py-1 font-bold uppercase tracking-widest">10% OFF</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Abonás desde tu home banking o app.</p>
                      </div>
                    </div>
                  </label>

                  {/* Opcion 3: Tarjeta / MercadoPago */}
                  <label onClick={() => setPaymentMethod('Tarjeta')} className={`block border p-3 cursor-pointer transition-all ${paymentMethod === 'Tarjeta' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className={`w-3 h-3 md:w-4 md:h-4 border flex items-center justify-center shrink-0 ${paymentMethod === 'Tarjeta' ? 'border-black' : 'border-gray-300'}`}>
                        {paymentMethod === 'Tarjeta' && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest">Crédito / Mercado Pago</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Tarjetas de crédito o débito a precio de lista.</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Resumen Total: Reducción de padding de p-6 a p-4 y márgenes ( space-y-1 mt-1 ) */}
                <div className="bg-gray-50 p-4 rounded-sm space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <Price amount={subtotal} />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase tracking-widest">
                      <span>Descuento Especial</span>
                      <span>-<Price amount={discount} /></span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest pt-2 border-t border-gray-200 mt-1 text-black">
                    <span>Total a pagar</span>
                    <Price amount={total} />
                  </div>
                </div>
              </div>
            )}

            {/* --- PASO 3: OTP FANTASMA --- */}
            {/* MICRO-COMPRESIÓN: Reducimos paddings verticales py-6 a py-2 md:py-4 context Turn 10 context logic context */}
            {step === 3 && (
              <div className="animate-in slide-in-from-right duration-300 flex flex-col items-center py-2 md:py-4">
                {/* Micro-compresión Icono mb-6 a mb-4 y text text-3xl */}
                <i className="fa-solid fa-shield-check text-3xl md:text-4xl text-black mb-4"></i>
                {/* Micro-compresión Título mb-2 a mb-1 y text text-xl */}
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-black mb-1">Seguridad</h3>
                {/* Micro-compresión Párrafo mb-8 a mb-6 */}
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center mb-6">
                  Enviamos un pin de acceso a <br/><span className="text-black">{formData.email}</span>
                </p>

                <input 
                  type="text" 
                  placeholder="000000" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                  maxLength={6}
                  className="w-full max-w-[200px] border-b border-gray-200 py-4 text-3xl font-black text-black focus:border-black outline-none tracking-[12px] placeholder:text-gray-200 transition-colors bg-transparent text-center mb-6"
                />
                
                {timeLeft > 0 ? (
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest animate-pulse">
                    Expira en {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => sendOtp(formData.email)} 
                    className="text-[10px] font-black text-black underline uppercase tracking-widest hover:text-gray-500 transition-colors cursor-pointer"
                  >
                    Reenviar código
                  </button>
                )}

                {/* EL PARCHE DE QA (TICKET 1): Botón para abortar si se equivocó de mail */}
                <button 
                  type="button"
                  onClick={() => {
                    clearOtpData();
                    setStep(1);
                  }}
                  className="mt-6 text-[9px] font-bold text-gray-400 underline uppercase tracking-widest hover:text-black transition-colors cursor-pointer"
                >
                  ¿Escribiste mal tu correo?
                </button>
              </div>
            )}
          </div>

          {/* BASE FIXA: Redujimos el padding de la botonera a p-4 y py-3 md:py-4 */}
          <div className="p-4 md:p-4 border-t border-gray-100 mt-auto shrink-0 bg-white">
            <div className="flex space-x-4">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)} 
                  disabled={loading || otpLoading}
                  className="px-8 border border-gray-200 text-[10px] font-black uppercase tracking-[3px] hover:bg-gray-50 text-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Atrás
                </button>
              )}
              
              {step < 3 ? (
                <button onClick={handleNext} disabled={loading || otpLoading} className={`flex-1 bg-black text-white py-3 md:py-4 text-[11px] font-black uppercase tracking-[4px] relative flex items-center justify-center transition-all hover:bg-gray-900 active:scale-[0.98] disabled:opacity-50 cursor-pointer`}>
                  {(loading || otpLoading) ? <i className="fa-solid fa-circle-notch fa-spin"></i> : step === 2 ?
                      <div className="flex flex-col items-center justify-center text-center">
                        <span>CONFIRMAR</span>
                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                           <Price amount={total} />
                        </div>
                      </div>
                  : 'Continuar'}
                </button>
              ) : (
                <button onClick={handleVerifyAndPay} disabled={loading || otpLoading || otpCode.length < 6 || timeLeft === 0} className="flex-1 bg-black text-white py-3 md:py-4 text-[11px] font-black uppercase tracking-[4px] relative flex items-center justify-center transition-all hover:bg-gray-900 active:scale-[0.98] disabled:opacity-50 cursor-pointer">
                  {(loading || otpLoading) ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Verificar y Pagar'}
                </button>
              )}
            </div>
          </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;