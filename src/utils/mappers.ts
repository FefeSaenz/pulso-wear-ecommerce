// utils/mappers.ts
import { Product, ProductVariant } from '../types/product.types';
import { ApiDress } from '../types/api';

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
        variant_id: v.variant_bound, 
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