// utils/mappers.ts
import { Product, ProductVariant, Order } from '@/src/types/product.types';
import { ApiDress } from '@/src/types/api';

// 🛟 DICCIONARIO DE RESCATE: Traduce Hex a Palabras si el sistema de gestión falla
const colorDictionary: Record<string, string> = {
  '#000000': 'NEGRO',
  '#ffffff': 'BLANCO',
  '#f7f7f7': 'BLANCO',
  '#f5f5f5': 'BLANCO',
  '#ff0000': 'ROJO',
  '#0000ff': 'AZUL',
  // Podés sumar más a futuro si usan otros colores seguido
};

/**
 * Adapter Pattern: Transforma un producto de la API al formato estandarizado de la UI.
 */
export const mapApiDressToProduct = (apiDress: ApiDress): Product => {
  const groupedVariants: Record<string, ProductVariant> = {};

  if (apiDress.dress_variants && apiDress.dress_variants.length > 0) {
    apiDress.dress_variants.forEach((v) => {
      
      // Aseguramos que el Hex esté en minúsculas para buscarlo en el diccionario
      const safeHex = (v.variant_hex || '#000000').toLowerCase().trim(); 

      // 1. LIMPIEZA DE COLOR INTELIGENTE
      let colorName = v.variant_color ? v.variant_color.trim().toUpperCase() : '';
      
      // Si el sistema de gestión mandó el nombre vacío, lo adivinamos usando el Hex
      if (colorName === '') {
        colorName = colorDictionary[safeHex] || `COLOR ${safeHex.toUpperCase()}`;
      }

      // Agrupamos usando el nombre final ya corregido
      const colorKey = colorName;

      if (!groupedVariants[colorKey]) {
        groupedVariants[colorKey] = {
          color: {
            name: colorName, 
            hex: safeHex,
            image: v.variant_picture,
          },
          sizes: [],
        };
      }

      // 2. MANEJO DE STOCK (Acá ocurre la magia del tachado)
      groupedVariants[colorKey].sizes.push({
        size: v.variant_size,
        sku: v.variant_sku || apiDress.dress_sku,
        // Agregamos el ID único de la variante que nos manda el backend:
        variant_id: v.variant_id, 
        stock: v.variant_stock !== null ? v.variant_stock : 99,
        available: v.variant_stock === null || v.variant_stock > 0, 
      });
    });
  } else {
    // Escudo extremo por si mandan un producto sin ninguna variante
    groupedVariants['NEGRO'] = {
      color: { name: 'NEGRO', hex: '#000000' },
      sizes: [{ size: 'U', sku: apiDress.dress_sku, stock: 10, available: true }]
    };
  }

  return {
    id: apiDress.dress_bound.toString(),
    slug: apiDress.dress_slug,
    name: apiDress.dress_name,
    description: apiDress.dress_description,
    price: apiDress.dress_price,
    original_price: null,
    discount_percentage: null,
    images: apiDress.dress_pictures || [],
    category: apiDress.category_name,
    base_sku: apiDress.dress_sku,
    brand: apiDress.brand_name,
    material: apiDress.dress_material,
    active: true,
    tags: apiDress.dress_highlight === 1 ? 'Destacado' : undefined, 
    variants: Object.values(groupedVariants),
  };
};

/**
 * Utilidad extra para extraer categorías únicas del catálogo
 */
export const extractUniqueCategories = (products: Product[]): string[] => {
  const categories = products.map(p => p.category);
  return Array.from(new Set(categories)); // Elimina duplicados
};

/**
 * Adapter Pattern (Strict): Transforma una Orden de la API al formato de la UI.
 * Basado en el endpoint exclusivo GET /shop/cart/{id}
 */
export const mapOrderFromApi = (apiData: any): Order => {
  // Buscamos la orden (dependiendo si el back la mandó suelta o adentro del array orders filtrado)
  const backOrder = apiData?.order?.order_id ? apiData.order : (apiData?.customer?.orders?.[0] || apiData);
  const backProfile = apiData?.profile || apiData?.customer?.profile;

  // Validación amigable pero estricta
  if (!backOrder || (!backOrder.order_id && !backOrder.order_number)) {
    console.warn("⚠️ Aviso de parseo: El backend envió una estructura inesperada para la orden.", apiData);
    throw new Error("Estructura de datos de la orden inválida");
  }

  return {
    id: backOrder.order_number || backOrder.order_id?.toString() || 'ID-NO-ENCONTRADO',
    date: backOrder.order_date || new Date().toISOString(),
    status: backOrder.order_condition_name || 'Procesando',
    customer: {
      name: backProfile?.person_name || backOrder.person_name || 'Cliente',
      email: backProfile?.person_email || '',
      phone: backProfile?.person_cellphone || backOrder.person_cellphone || '',
      dni_cuit: '' 
    },
    summary: {
      subtotal: backOrder.order_subtotal || 0,
      discount: backOrder.order_discount_amount || 0,
      shipping: 0,
      total: backOrder.order_total || 0
    },
    payment: {
      method: backOrder.box_paymethod_name || 'Efectivo', 
      status: 'pending'
    },
    shipping: {
      method: backOrder.order_detail_address?.includes('Retiro') ? 'Pickup' : 'Standard',
      address: backOrder.order_detail_address || 'Dirección no especificada',
      city: '',
      zip: ''
    },
    items: (backOrder.order_items || []).map((item: any) => ({
      id: item.article_id?.toString() || '0',
      variant_id: item.variant_id,
      name: item.dress_name || 'Producto',
      price: item.item_cost || 0,
      quantity: item.item_count || 1,
      selectedColor: item.variant_color || 'N/A',
      selectedSize: item.variant_size || 'N/A',
      selectedImage: item.dress_picture || undefined 
    }))
  };
};