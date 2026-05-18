import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '@/src/types/product.types';
import { useAuth } from '@/src/context/AuthContext';
import { useOtpAuth } from '@/src/hooks/useOtpAuth';
import { toast } from 'sonner';
import Price from './Price';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, orders }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1); 
  
  // LÓGICA DE OTP DENTRO DEL HOOK USEOTPAUTH
  const { 
    email, setEmail, otpCode, setOtpCode, loading, timeLeft, 
    isCodeSent, sendOtp, verifyOtp, clearOtpData, syncState 
  } = useOtpAuth();

  // EFECTO MAESTRO: Si se abre el panel, obligamos a leer la verdad del localStorage
  useEffect(() => {
    if (isOpen) {
      syncState();
    }
  }, [isOpen, syncState]);

  // Si descubrimos que ya había un código enviado en otra pestaña/modal, pasamos al Paso 2
  useEffect(() => {
    if (isCodeSent) setStep(2);
    else setStep(1);
  }, [isCodeSent]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendCode = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Por favor, ingresá un email válido.');
      return;
    }
    // LLAMADA REAL AL BACKEND (delegada al hook)
    const success = await sendOtp(email);
    if (success) {
      setStep(2);
    }
  };

  const handleVerifyCode = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    // LLAMADA REAL AL BACKEND VERIFICANDO CÓDIGO (delegada al hook)
    const token = await verifyOtp();
    
    if (token) {
      // Asumimos que tu backend devuelve { token: "..." }
      login({ email, token });
      toast.success('¡Sesión iniciada con éxito!');
      setStep(1); 
    }
  };

  const handleLogout = () => {
    logout();
    setEmail('');
    setStep(1);
    // Limpieza por las dudas
    clearOtpData();
    toast.success('Sesión cerrada.');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, ''); 
    setOtpCode(onlyNums);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full bg-white z-50 w-full max-w-100 shadow-2xl transition-transform duration-300 transform flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-sm font-black uppercase tracking-[4px] text-black">
            {isAuthenticated ? 'Mi Perfil' : 'Ingresar'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors w-8 h-8 flex items-center justify-center cursor-pointer">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          
          {isAuthenticated ? (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 bg-gray-50 p-6 border border-gray-200 text-center">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black uppercase">
                  {user?.email.charAt(0)}
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-1">¡Hola de nuevo!</h3>
                <p className="text-xs text-black font-bold uppercase tracking-widest">{user?.email}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-6 border-b border-gray-100 pb-2">Mis Pedidos</h3>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200">
                    <i className="fa-solid fa-box-open text-3xl text-gray-300 mb-3"></i>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No tienes pedidos aún</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <Link 
                        key={order.id} 
                        to={`/orden/${order.id}`} 
                        onClick={onClose} // Cerramos el drawer al navegar
                        className="block border border-gray-100 p-5 rounded-sm bg-gray-50/50 hover:border-black transition-colors mb-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] font-black tracking-widest text-black">ORDEN #{order.id}</p>
                            <p className="text-[9px] text-gray-400 uppercase font-bold mt-1">
                              {new Date(order.date || '').toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 ${
                            order.status === 'Procesando' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="flex -space-x-2 mb-4 overflow-hidden">
                          {order.items.map((item, idx) => (
                            <img 
                              key={idx} 
                              src={item.selectedImage || item.images?.[0]} 
                              className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-sm"
                              alt={item.name}
                            />
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                          <Price amount={order.summary.total} className="text-xs font-black text-black" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleLogout}
                className="w-full border border-red-500 text-red-500 py-4 text-[10px] font-black uppercase tracking-[3px] hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-center -mt-10">
              <div className="text-center mb-10">
                <i className="fa-solid fa-shield-halved text-4xl text-black mb-6"></i>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-black mb-2">Acceso Seguro</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {step === 1 ? 'Ingresá tu mail y te enviamos un pin de acceso.' : 'Revisá tu bandeja de entrada o spam.'}
                </p>
              </div>

              {step === 1 ? (
                <form onSubmit={handleSendCode} className="space-y-6 animate-in slide-in-from-right duration-300">
                  {/* FIX IOS ZOOM: text-[16px] md:text-xs */}
                  <input 
                    type="email" 
                    placeholder="TU EMAIL" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-gray-200 py-4 text-[16px] md:text-xs font-bold text-black focus:border-black outline-none uppercase tracking-widest placeholder:text-gray-300 transition-colors bg-transparent text-center"
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !email.includes('@')}
                    className="w-full bg-black text-white py-5 text-[11px] font-black uppercase tracking-[4px] relative flex items-center justify-center transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex justify-center items-center h-4 w-4">
                        <svg className="animate-spin h-full w-full text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : 'Recibir Código'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-black uppercase tracking-widest">
                      Código enviado a <br/><span className="text-gray-500">{email}</span>
                    </p>
                    
                    {timeLeft > 0 ? (
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest animate-pulse">
                        Expira en {formatTime(timeLeft)}
                      </p>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => handleSendCode()} 
                        className="text-[10px] font-black text-black underline uppercase tracking-widest hover:text-gray-500 transition-colors"
                      >
                        Reenviar código
                      </button>
                    )}
                  </div>
                  {/* FIX IOS ZOOM: text-[16px] md:text-2xl para que no haga zoom pero siga siendo grande en PC */}
                  <input 
                    type="text" 
                    placeholder="000000" 
                    value={otpCode}
                    onChange={handleOtpChange} 
                    maxLength={6}
                    className="w-full border-b border-gray-200 py-4 text-[16px] md:text-2xl font-black text-black focus:border-black outline-none tracking-[10px] placeholder:text-gray-200 transition-colors bg-transparent text-center"
                  />
                  <div className="flex space-x-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setStep(1);
                        clearOtpData();
                      }}
                      className="px-6 border border-gray-200 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading || otpCode.length < 6 || timeLeft === 0}
                      className="flex-1 bg-black text-white py-5 text-[11px] font-black uppercase tracking-[4px] relative flex items-center justify-center transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <div className="flex justify-center items-center h-4 w-4">
                          <svg className="animate-spin h-full w-full text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : 'Verificar Código'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default UserProfile;