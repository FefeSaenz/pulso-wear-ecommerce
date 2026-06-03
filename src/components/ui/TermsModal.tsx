import React from 'react';
import Modal from './Modal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      
      {/* HEADER FLOTANTE */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
        <h2 className="text-sm font-black uppercase tracking-[3px]">Preguntas Frecuentes / Políticas</h2>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-black transition-transform hover:rotate-90 duration-300 cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      {/* CUERPO DEL TEXTO */}
      <div className="p-6 md:p-10 overflow-y-auto max-h-[65vh] custom-scrollbar text-xs md:text-sm text-gray-600 space-y-8 leading-relaxed">
        
        {/* SECCIÓN 1 */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-black uppercase tracking-[2px] text-black">¿Realizan cambios?</h3>
          <p>
            Si la prenda se encuentra fallada o necesitás otro talle, podés realizar un cambio acercándote a nuestro local: <strong>Buenos Aires 60 - Paseo de las luces, Paraná, Entre Ríos</strong>. Los cambios se realizan de martes a sábados de 17:00 a 20:00 hs.
          </p>
          <p>
            En el caso de querer hacer un cambio y vivas en el interior, deberás comunicarte a nuestro WhatsApp (encontrás el ícono en nuestra página abajo a la derecha) para coordinar. Los envíos por devolución son siempre a cargo del comprador.
          </p>
          
          {/* Subtítulo ajustado a 11px */}
          <p className="text-[11px] font-black uppercase tracking-[2px] text-black mt-4">Podrás cambiar tu pedido si cumplen estas condiciones:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Está en buen estado y sin uso.</li>
            <li>En su packaging original con etiquetas.</li>
            <li>Está dentro de los 15 días de realizada la compra.</li>
            <li>Deberás presentar el remito o factura.</li>
            <li>La ropa de otra temporada o rebajas NO TIENE CAMBIO. Sin excepción.</li>
            <li>En caso de querer cambiar una prenda adquirida en SALE/OFERTA se tomará como referencia el valor abonado.</li>
          </ul>
        </div>

        {/* SECCIÓN 2 */}
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <h3 className="text-[12px] font-black uppercase tracking-[2px] text-black">¿Cómo realizo una compra?</h3>
          <p>
            Seleccioná el producto y la cantidad de unidades que desees. Una vez que hayas seleccionado todos los artículos, deberás proceder al pago de los mismos. Previamente el sistema te solicitará que ingreses tus datos personales para poder efectuar la compra.
          </p>
          <p>
            Deberás elegir la dirección de entrega de tu compra; es muy importante que estos datos sean correctos y exactos (Dirección, altura, piso y nro). El pago se realiza a través de MercadoPago, podés pagar con tarjeta de crédito, débito, efectivo o transferencia bancaria. También es posible seleccionar la opción "retirar por local" y abonarlo en el momento.
          </p>
          <p>
            Una vez confirmado el pago te enviaremos un email de confirmación, y dentro de las 72 horas hábiles despacharemos tu pedido, dependiendo la forma de envío que hayas elegido.
          </p>
        </div>

        {/* SECCIÓN 3 */}
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <h3 className="text-[12px] font-black uppercase tracking-[2px] text-black">Envíos y Entregas</h3>
          
          {/* Subtítulos ajustados a 11px */}
          <p className="text-[11px] font-black uppercase tracking-[2px] text-black mt-4">¿Quién me entrega el producto?</p>
          <p>
            Los productos serán entregados por la empresa CORREO ARGENTINO a través de un empleado debidamente identificado. También podemos coordinar el envío en moto (entregados en 24 horas dentro de la ciudad de Paraná). El pago del envío en moto es abonado al repartidor en efectivo.
          </p>

          <p className="text-[11px] font-black uppercase tracking-[2px] text-black mt-4">¿Dónde puedo recibir el producto?</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Puerta a Puerta:</strong> Los envíos se entregan en el domicilio que nos indiques cuando realices tu pedido online.</li>
            <li><strong>Puerta a Sucursal:</strong> También podés retirarlo en la Sucursal CORREO ARGENTINO o PUNTO PICK UP más cercana a tu domicilio. Te informarán por e-mail para que pases a retirar tu pedido; una vez recibido el aviso queda guardado allí por 5 (cinco) días.</li>
          </ul>

          <p className="text-[11px] font-black uppercase tracking-[2px] text-black mt-4">¿Cuándo me llega el pedido?</p>
          <p>
            El tiempo de entrega dependerá del tipo de envío seleccionado. En general la demora se encuentra entre 2 y 10 días hábiles luego de acreditado el pago y dependiendo del stock disponible. Los fines de semana y feriados no se realizan envíos.
          </p>

          <p className="text-[11px] font-black uppercase tracking-[2px] text-black mt-4">¿Qué pasa si llega el pedido y no estoy?</p>
          <p>
            CORREO ARGENTINO realiza dos intentos de entrega en el domicilio. En caso de no concretarse la entrega en el segundo intento, te dejarán un aviso de visita para que coordines el retiro por la sucursal (contás con 5 días hábiles). Caso contrario el pedido vuelve a nuestro local y el envío del mismo deberá ser abonado nuevamente por el comprador.
          </p>

          <p className="text-[11px] font-black uppercase tracking-[2px] text-black mt-4">¿Inconvenientes con el envío o seguimiento?</p>
          <p>
            Una vez finalizada la compra y despachado el paquete, te facilitamos el número de seguimiento por mail. En caso de tener algún inconveniente, comunicate con nosotros a nuestro WhatsApp. 
            <br/><br/>
            <em>A tener en cuenta: El ingreso de datos precisos en el formulario es vital. Si el pedido no puede ser entregado por falta/error de datos, el comprador deberá abonar el reenvío.</em>
          </p>
        </div>

        {/* SECCIÓN 4 */}
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <h3 className="text-[12px] font-black uppercase tracking-[2px] text-black">¿Cuáles son las formas de pago?</h3>
          <p>
            Todos los precios están en pesos argentinos (AR$). Los precios no incluyen el costo de envío; este corre por cuenta del comprador y se calculará con tu código postal.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Tarjetas y MercadoPago:</strong> Abonando con tarjeta de crédito/débito la acreditación suele ser instantánea.</li>
            <li><strong>Retiro en Local:</strong> Podés abonar en efectivo en el momento, o con tarjetas/MercadoPago.</li>
            <li><strong>Transferencia Bancaria:</strong> Al seleccionar esta opción, contactate con nuestro WhatsApp para que podamos enviarte los datos de la cuenta y nos envíes el comprobante.</li>
          </ul>
        </div>

        {/* SECCIÓN 5 */}
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <h3 className="text-[12px] font-black uppercase tracking-[2px] text-black">¿Tienen tienda física?</h3>
          <p>
            ¡Sí! Tenemos nuestra tienda ubicada en <strong>Buenos Aires 60 - Paseo de las luces, Paraná, Entre Ríos</strong>. Podés acercarte para retirar tu pedido, cambiar o probar la prenda.
          </p>
          <p>
            <strong>Días y horarios:</strong> De Martes a Sábado de 17:00 a 20:00 horas.
          </p>
        </div>

      </div>
      
      {/* FOOTER DEL MODAL */}
      <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50">
        <button 
          onClick={onClose}
          className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[3px] hover:bg-gray-900 transition-colors cursor-pointer"
        >
          Entendido
        </button>
      </div>

    </Modal>
  );
};

export default TermsModal;