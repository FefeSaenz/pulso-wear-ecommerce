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
  images: string[]; // Changed from single image to array
  category: string;
  subcategory?: string;
  gender?: string;
  variants: ProductVariant[]; // Estructura anidada real
  tags?: string;
  active: boolean;
  rating?: number;
  reviews_count?: number;
  //promo?: string;
  //sizes: string[];
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
}

/**
 * TIPOS AUXILIARES PARA PEDIDOS
 */
export type OrderStatus = 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
}
