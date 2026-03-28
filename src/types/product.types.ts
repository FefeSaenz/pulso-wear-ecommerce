/**
 * ESTRUCTURA DE VARIANTES
 * Un producto puede tener múltiples variantes de color, 
 * y cada color su propia curva de talles y stock.
 */
export interface ProductSize {
  size: string | number;
  sku: string;
  stock: number;
  available: boolean;
}

export interface ProductVariant {
  color: {
    name: string;
    hex: string;
    image?: string; // URL de imagen específica de este color
  };
  sizes: ProductSize[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  images: string[];
  category: string;
  subcategory?: string;
  gender?: string;
  base_sku?: string;
  brand?: string;
  material?: string;
  variants: ProductVariant[]; // Estructura anidada real
  tags?: string;
  active: boolean;
  rating?: number;
  reviews_count?: number;
  //promo?: string;
}

/**
 * INTERFAZ PARA EL CARRITO
 * Incluye la selección específica del usuario
 */
export interface CartItem extends Omit<Product, 'variants'> {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  selectedImage: string;
  //variant_sku: string;
}

/**
 * TIPOS AUXILIARES PARA PEDIDOS
 */
export type OrderStatus = 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
/*
export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
}
*/

export interface Order {
  id: string;                // ID único de la orden (Generado por Backend)
  external_reference?: string; // ID de la transacción en la pasarela (ej: Mercado Pago / Stripe)
  date: string;              // ISO Date
  status: OrderStatus;
  
  // --- Datos del Cliente ---
  customer: {
    id: string;              // UID del usuario (Auth Google/JWT)
    email: string;
    name: string;
    dni_cuit?: string;       // Necesario para facturación legal en Argentina
    phone: string;
  };

  // --- Desglose Financiero (Single Source of Truth) ---
  summary: {
    subtotal: number;        // Suma de (precio * cantidad)
    shipping: number;        // Costo de envío aplicado
    discount: number;        // Descuento total (por cupones o promos)
    total: number;           // Monto final neto cobrado
  };

  // --- Información de Pago ---
  payment: {
    method: 'MercadoPago' | 'Transferencia' | 'Tarjeta'; 
    status: 'pending' | 'approved' | 'rejected';
    installments?: number;   // Cantidad de cuotas
    last_four?: string;      // Últimos 4 dígitos para control de gestión
  };

  // --- Logística ---
  shipping: {
    method: 'Standard' | 'Express' | 'Pickup';
    address: string;
    city: string;
    zip: string;
    tracking_number?: string; // Lo completa el de gestión después
  };

  items: CartItem[];
}