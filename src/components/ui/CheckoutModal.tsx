import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '@/src/types/product.types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Price from './Price';
import api from '@/src/api/axios'; 

// Importamos el contexto de autenticación que creaste
import { useAuth } from '@/src/context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onComplete: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Traemos al usuario logueado
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Nuevos estados de Negocio
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Pickup'>('Standard');
  // Nota: Asegurate de que 'Efectivo' esté agregado en tu product.types.ts en payment.method
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Transferencia');
  
  const [formData, setFormData] = useState({
    email: '', 
    name: '',
    dni: '',
    phone: '',
    address: '', 
    city: '', 
    zip: '',
  });

  // EFECTO: Pre-llenar el email si el usuario está logueado
  useEffect(() => {
    if (isOpen) {
      // Al abrir: Forzamos el mail del usuario logueado. Si es nulo, string vacío.
      setFormData((prev) => ({ 
        ...prev, 
        email: user ? user.email : '' 
      }));
    } else {
      // Al cerrar: Hacemos un "Reseteo de Fábrica" para matar cualquier dato fantasma
      setStep(1);
      setErrors([]);
      setFormData({
        email: '', 
        name: '',
        dni: '',
        phone: '',
        address: '', 
        city: '', 
        zip: '',
      });
    }
  }, [isOpen, user]);
  
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Descuento del 10% si es Efectivo o Transferencia
  const discount = (paymentMethod === 'Efectivo' || paymentMethod === 'Transferencia') ? subtotal * 0.10 : 0;
  const total = subtotal - discount;

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
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    if (errors.includes(fieldName)) {
      setErrors((prevErrors) => prevErrors.filter((error) => error !== fieldName));
    }
  };

  const handleNext = async () => {
    setErrors([]);

    if (step === 1) {
      if (validateStep()) {
        setStep(2);
      }
    } else if (step === 2) {
      setLoading(true);
      
      // Mapeamos el carrito y le extirpamos la propiedad 'variants' a cada producto
      const cleanedItems = cart.map((item) => {
        return {
          article_id: parseInt(item.id), // ID del producto genérico
          variant_id: item.variant_id, // El ID de la variante exacta (Talle+Color)
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

        setLoading(false);
        toast.success(`¡Pedido #${orderIdGenerado} generado con éxito!`);
        
        // ESTO ES CLAVE: Le pasamos la orden finalizada al contexto
        onComplete(finalizedOrder); 
        
        onClose();
        navigate(`/orden/${orderIdGenerado}`); 
      } catch (error) {
        console.error("Error al enviar el pedido:", error);
        setLoading(false);
        toast.error("Hubo un error al procesar tu pedido. Por favor, intentá nuevamente.");
      }
    }
  };

  const getInputClass = (fieldName: string) => {
    const baseClass = "w-full border-b py-3 text-xs font-bold text-black focus:border-black outline-none uppercase tracking-widest placeholder:text-gray-300 transition-colors bg-transparent";
    const errorClass = errors.includes(fieldName) ? "border-red-500" : "border-gray-200";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex border-b border-gray-100">
        {[1, 2].map((s) => (
          <div key={s} className={`flex-1 py-4 text-center text-[10px] font-black uppercase tracking-[3px] transition-colors ${step >= s ? 'text-black' : 'text-gray-300'}`}>
            {s === 1 ? 'Información' : 'Pago'}
            <div className={`h-0.5 mt-2 mx-auto w-12 transition-colors ${step >= s ? 'bg-black' : 'bg-gray-100'}`} />
          </div>
        ))}
      </div>

      <div className="p-8 md:p-12">
        {/* PASO 1: ENVÍO */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6 text-black">Entrega</h3>
            
            {/* SELECTOR DE ENVÍO VS RETIRO */}
            <div className="flex space-x-4 mb-8">
              <button 
                onClick={() => setShippingMethod('Standard')}
                className={`flex-1 py-4 border text-[10px] font-black uppercase tracking-widest transition-all ${shippingMethod === 'Standard' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}
              >
                Envío a Domicilio
              </button>
              <button 
                onClick={() => setShippingMethod('Pickup')}
                className={`flex-1 py-4 border text-[10px] font-black uppercase tracking-widest transition-all ${shippingMethod === 'Pickup' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}
              >
                Retiro en Local
              </button>
            </div>

            <div className="space-y-4">
              <input type="email" placeholder="EMAIL" className={getInputClass('email')} onChange={(e) => handleInputChange(e, 'email')} value={formData.email} />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="NOMBRE COMPLETO" className={getInputClass('name')} onChange={(e) => handleInputChange(e, 'name')} value={formData.name} />
                <input type="text" placeholder="DNI / CUIT" className={getInputClass('dni')} onChange={(e) => handleInputChange(e, 'dni')} value={formData.dni} />
              </div>
              
              <input type="tel" placeholder="TELÉFONO (Para WhatsApp)" className={getInputClass('phone')} onChange={(e) => handleInputChange(e, 'phone')} value={formData.phone} />
              
              {/* ESTOS CAMPOS SOLO APARECEN SI ELIGE ENVÍO */}
              {shippingMethod === 'Standard' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4 pt-4">
                  <input type="text" placeholder="DIRECCIÓN Y NÚMERO" className={getInputClass('address')} onChange={(e) => handleInputChange(e, 'address')} value={formData.address} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="CIUDAD" className={getInputClass('city')} onChange={(e) => handleInputChange(e, 'city')} value={formData.city} />
                    <input type="text" placeholder="CÓDIGO POSTAL" className={getInputClass('zip')} onChange={(e) => handleInputChange(e, 'zip')} value={formData.zip} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 2: PAGO */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6 text-black">Método de Pago</h3>
            
            <div className="space-y-4 mb-8">
              {/* Opcion 1: Efectivo */}
              <label onClick={() => setPaymentMethod('Efectivo')} className={`block border p-5 cursor-pointer transition-all ${paymentMethod === 'Efectivo' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                {/* ACÁ ESTÁ EL CAMBIO: items-center en el flex principal */}
                <div className="flex items-center space-x-4">
                  {/* ACÁ ESTÁ EL CAMBIO: sin mt-0.5 */}
                  <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${paymentMethod === 'Efectivo' ? 'border-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'Efectivo' && <div className="w-2 h-2 bg-black" />}
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
              <label onClick={() => setPaymentMethod('Transferencia')} className={`block border p-5 cursor-pointer transition-all ${paymentMethod === 'Transferencia' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${paymentMethod === 'Transferencia' ? 'border-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'Transferencia' && <div className="w-2 h-2 bg-black" />}
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
              <label onClick={() => setPaymentMethod('Tarjeta')} className={`block border p-5 cursor-pointer transition-all ${paymentMethod === 'Tarjeta' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${paymentMethod === 'Tarjeta' ? 'border-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'Tarjeta' && <div className="w-2 h-2 bg-black" />}
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

            {/* Resumen Total */}
            <div className="bg-gray-50 p-6 rounded-sm space-y-2">
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
              <div className="flex justify-between text-xs font-black uppercase tracking-widest pt-2 border-t border-gray-200 mt-2 text-black">
                <span>Total a pagar</span>
                <Price amount={total} />
              </div>
            </div>
          </div>
        )}

        {/* BOTONES DE NAVEGACIÓN */}
        <div className="mt-12 flex space-x-4">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="px-8 border border-gray-200 text-[10px] font-black uppercase tracking-[3px] hover:bg-gray-50 text-black transition-colors">
              Atrás
            </button>
          )}
          <button onClick={handleNext} disabled={loading} className="flex-1 bg-black text-white py-5 text-[11px] font-black uppercase tracking-[4px] relative flex items-center justify-center transition-all hover:bg-gray-900 active:scale-[0.98] disabled:opacity-50">
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : step === 2 ? <>CONFIRMAR <Price amount={total} className="ml-2" /></> : 'Continuar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;