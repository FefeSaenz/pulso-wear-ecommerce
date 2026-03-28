import React, { useState } from 'react';
import { CartItem, Order } from '../../types/product.types';
import Modal from './Modal'; // Asegurate de que la ruta sea correcta
import Price from './Price';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onComplete: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]); // Estado para manejar errores de validación
  
  const [formData, setFormData] = useState({
    email: '', 
    name: '',
    address: '', 
    city: '', 
    zip: '',
    phone: ''
  });
  
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Si no está abierto, el componente Modal ya se encarga de retornar null, 
  // pero lo mantenemos acá por seguridad de lógica.
  if (!isOpen) return null;

  /**
   * VALIDACIÓN DE CAMPOS
   * Centralizamos la lógica para verificar que el usuario completó lo necesario.
   */
  const validateStep = () => {
    const newErrors: string[] = [];
    if (step === 1) {
      if (!formData.name.trim()) newErrors.push('name');
      if (!formData.email.trim() || !formData.email.includes('@')) newErrors.push('email');
      if (!formData.address.trim()) newErrors.push('address');
      if (!formData.phone.trim()) newErrors.push('phone');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  /**
   * MANEJADOR DINÁMICO DE INPUTS
   * Actualiza el estado del formulario y limpia los errores en tiempo real
   * para que el usuario reciba feedback inmediato al corregir un campo vacío.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof formData) => {
    const { value } = e.target;
    
    // 1. Actualizamos los datos del formulario
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // 2. Validación Dinámica: Si este campo tenía un error, lo limpiamos de inmediato
    if (errors.includes(fieldName)) {
      setErrors((prevErrors) => prevErrors.filter((error) => error !== fieldName));
    }
  };

  /**
   * MANEJADOR DE PASOS (handleNext)
   * Lógica blindada para avanzar entre Información -> Pago -> Confirmación
   */
  const handleNext = () => {
    // Limpiamos errores previos al intentar avanzar
    setErrors([]);

    if (step === 1) {
      if (validateStep()) {
        setStep(2);
      }
    } else if (step === 2) {
      setLoading(true);
      // Simulamos latencia de red para procesar el pago (Senior UX)
      setTimeout(() => {
        const newOrder: Order = {
          id: `ORD-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
          date: new Date().toISOString(),
          items: [...cart],
          status: 'Procesando',
          customer: {
            id: 'GUEST_ID', // Esto luego vendrá del ID de Google Auth/JWT
            email: formData.email,
            name: formData.name,
            phone: formData.phone
          },
          summary: {
            subtotal: total,
            shipping: 0,
            discount: 0,
            total: total
          },
          payment: {
            method: 'MercadoPago',
            status: 'approved'
          },
          shipping: {
            method: 'Standard',
            address: formData.address,
            city: formData.city,
            zip: formData.zip
          }
        };

        setLoading(false);
        onComplete(newOrder);
        setStep(3);
      }, 2000);
    }
  };

  // Helper para aplicar clases de error a los inputs
  const getInputClass = (fieldName: string) => {
    const baseClass = "w-full border-b py-3 text-xs font-bold text-black focus:border-black outline-none uppercase tracking-widest placeholder:text-gray-300 transition-colors";
    const errorClass = errors.includes(fieldName) ? "border-red-500" : "border-gray-200";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={step < 3 ? onClose : () => {}} // Evita cerrar si el pedido ya se confirmó
      maxWidth="max-w-2xl"
    >
      {/* --- CABECERA DE PASOS --- */}
      {step < 3 && (
        <div className="flex border-b border-gray-100">
          {[1, 2].map((s) => (
            <div 
              key={s} 
              className={`flex-1 py-4 text-center text-[10px] font-black uppercase tracking-[3px] transition-colors ${
                step >= s ? 'text-black' : 'text-gray-300'
              }`}
            >
              {s === 1 ? 'Información' : 'Pago'}
              <div className={`h-0.5 mt-2 mx-auto w-12 transition-colors ${step >= s ? 'bg-black' : 'bg-gray-100'}`} />
            </div>
          ))}
        </div>
      )}

      <div className="p-8 md:p-12">
        {/* PASO 1: ENVÍO */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 text-black">Información de Envío</h3>
            <div className="space-y-4">
              <input 
                type="text" placeholder="NOMBRE COMPLETO" 
                className={getInputClass('name')}
                onChange={(e) => handleInputChange(e, 'name')}
                value={formData.name}
              />
              <input 
                type="email" placeholder="EMAIL" 
                className={getInputClass('email')}
                onChange={(e) => handleInputChange(e, 'email')}
                value={formData.email}
              />
              <input 
                type="tel" placeholder="TELÉFONO" 
                className={getInputClass('phone')}
                onChange={(e) => handleInputChange(e, 'phone')}
                value={formData.phone}
              />
              <input 
                type="text" placeholder="DIRECCIÓN" 
                className={getInputClass('address')}
                onChange={(e) => handleInputChange(e, 'address')}
                value={formData.address}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="CIUDAD" 
                  className={getInputClass('city')}
                  onChange={(e) => handleInputChange(e, 'city')}
                  value={formData.city}
                />
                <input 
                  type="text" placeholder="CP" 
                  className={getInputClass('zip')}
                  onChange={(e) => handleInputChange(e, 'zip')}
                  value={formData.zip}
                />
              </div>
              {errors.length > 0 && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2 animate-pulse">
                  Por favor, completá los campos obligatorios.
                </p>
              )}
            </div>
          </div>
        )}

        {/* PASO 2: PAGO */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 text-black">Método de Pago</h3>
            <div className="bg-gray-50 p-6 mb-8 rounded-sm">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-black">
                <span>Total a pagar</span>
                <Price amount={total} className="font-black" />
              </div>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="NOMBRE EN TARJETA" className="w-full border-b border-gray-200 py-3 text-xs font-bold focus:border-black outline-none uppercase tracking-widest text-black" />
              <input type="text" placeholder="NÚMERO DE TARJETA" className="w-full border-b border-gray-200 py-3 text-xs font-bold focus:border-black outline-none uppercase tracking-widest text-black" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="MM/YY" className="border-b border-gray-200 py-3 text-xs font-bold focus:border-black outline-none uppercase tracking-widest text-black" />
                <input type="text" placeholder="CVV" className="border-b border-gray-200 py-3 text-xs font-bold focus:border-black outline-none uppercase tracking-widest text-black" />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: CONFIRMACIÓN */}
        {step === 3 && (
          <div className="text-center py-12 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8 text-white">
              <i className="fa-solid fa-check text-3xl"></i>
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black">¡Pedido Confirmado!</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-12 leading-relaxed">
              Gracias por tu compra, {formData.name.split(' ')[0] || 'amig@'}.<br />
              Recibirás un correo con los detalles en breve.
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-black text-white py-5 text-[11px] font-black uppercase tracking-[4px] hover:bg-gray-800 transition-colors"
            >
              Volver a la tienda
            </button>
          </div>
        )}

        {/* BOTONES DE NAVEGACIÓN INTERNA */}
        {step < 3 && (
          <div className="mt-12 flex space-x-4">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)}
                className="px-8 border border-gray-200 text-[10px] font-black uppercase tracking-[3px] hover:bg-gray-50 text-black transition-colors"
              >
                Atrás
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={loading}
              className="flex-1 bg-black text-white py-5 text-[11px] font-black uppercase tracking-[4px] relative flex items-center justify-center transition-all hover:bg-gray-900 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                step === 2 ? <>PAGAR <Price amount={total} className="ml-2" /></> : 'Continuar'
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CheckoutModal;