import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '@/src/types/product.types';
import api from '@/src/api/axios';
import Price from '@/src/components/ui/Price';

const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const WHATSAPP_NUMBER = "5493431234567"; // Tu número acá

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // LLAMADA REAL A LA API
        // Nota: Confirmá con tu backend si la ruta exacta es /shop/cart/, /shop/order/ o /shop/checkout/
        const response = await api.get(`/shop/cart/${id}`);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al traer la orden:", err);
        setError(true);
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const generateWhatsAppLink = () => {
    if (!order) return "#";
    const text = `¡Hola Pulso! Acabo de realizar el pedido *#${order.id}* por un total de *$${order.summary.total}*. Quiero coordinar el pago/envío.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
        <p className="text-[10px] font-black uppercase tracking-[3px]">Buscando tu pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-5 text-center">
        <i className="fa-solid fa-triangle-exclamation text-4xl mb-4 text-red-500"></i>
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Pedido no encontrado</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-8">No pudimos cargar los datos de la orden #{id}.</p>
        <Link to="/" className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[3px] hover:bg-gray-800 transition-colors cursor-pointer">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 md:py-20 animate-in fade-in duration-500">
      
      {/* HEADER DEL RECIBO */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-green-500/20">
          <i className="fa-solid fa-check text-2xl"></i>
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2 text-black">¡Pedido Confirmado!</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
          ORDEN #{order.id}
        </p>
      </div>

      {/* CAJA DE DETALLES */}
      <div className="border border-gray-200 p-6 md:p-10 rounded-sm mb-8">
        
        {/* ESTADO Y FECHA */}
        <div className="flex flex-col md:flex-row justify-between pb-6 border-b border-gray-100 mb-6 gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-400 mb-1">Estado</p>
            <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest ${order.status === 'Procesando' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
              {order.status}
            </span>
          </div>
          <div className="md:text-right">
            <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-400 mb-1">Fecha</p>
            <p className="text-xs font-bold uppercase tracking-widest text-black">
              {new Date(order.date || '').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* DATOS DEL CLIENTE Y LOGÍSTICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-400 mb-3">Datos del Cliente</p>
            <p className="text-xs font-bold text-black uppercase">{order.customer.name}</p>
            <p className="text-xs text-gray-500">{order.customer.email}</p>
            <p className="text-xs text-gray-500">{order.customer.phone}</p>
            {order.customer.dni_cuit && <p className="text-xs text-gray-500">DNI: {order.customer.dni_cuit}</p>}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-400 mb-3">Entrega: {order.shipping.method}</p>
            <p className="text-xs font-bold text-black uppercase">{order.shipping.address}</p>
            <p className="text-xs text-gray-500">{order.shipping.city}, CP: {order.shipping.zip}</p>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="mb-8">
          <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-400 mb-4">Productos</p>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-center space-x-4">
                  {/* Acá aplicamos el ?. para evitar errores si no hay imagen */}
                  <img src={item.selectedImage || item.images?.[0]} alt={item.name} className="w-12 h-12 object-cover border border-gray-200" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">{item.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {item.selectedColor || 'N/A'} | Talle {item.selectedSize || 'N/A'} | Cant: {item.quantity}
                    </p>
                  </div>
                </div>
                <Price amount={item.price * item.quantity} className="text-xs font-black" />
              </div>
            ))}
          </div>
        </div>

        {/* TOTALES */}
        <div className="border-t border-black pt-6">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Subtotal</span>
            <Price amount={order.summary.subtotal} />
          </div>
          {(order.summary.discount ?? 0) > 0 && (
            <div className="flex justify-between text-xs font-bold text-green-600 uppercase tracking-widest mb-2">
              <span>Descuento</span>
              <span>-<Price amount={order.summary.discount} /></span>
            </div>
          )}
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-400 mb-1">Pago: {order.payment.method}</p>
              <p className="text-2xl font-black text-black">TOTAL</p>
            </div>
            <Price amount={order.summary.total} className="text-2xl font-black text-black" />
          </div>
        </div>
      </div>

      {/* ACCIONES FINALES */}
      <div className="flex flex-col space-y-4">
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] text-white py-5 px-6 text-center text-[11px] font-black uppercase tracking-[4px] hover:bg-[#20bd5a] transition-colors flex items-center justify-center space-x-3 cursor-pointer"
        >
          <i className="fa-brands fa-whatsapp text-lg"></i>
          <span>Coordinar por WhatsApp</span>
        </a>
        <Link 
          to="/"
          className="w-full border border-black text-black py-4 px-6 text-center text-[10px] font-black uppercase tracking-[3px] hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          Volver al Inicio
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;