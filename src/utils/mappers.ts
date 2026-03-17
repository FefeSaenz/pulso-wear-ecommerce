import { Product, ProductVariant } from '../types/product.types';
import { FeaturedProduct } from '../types/api';

/*
 * Transforma un producto de la API (destacados) al formato estandarizado que usa la interfaz de UI 'Product'.
*/
export const mapApiProductToLocal = (apiProd: FeaturedProduct): Product => {
  // Creamos una variante "por defecto" para que los filtros de la UI no rompan
  // al intentar buscar talles en un producto que viene de 'Featured'
  const defaultVariants: ProductVariant[] = [{
    color: { name: 'Único', hex: '#000000' },
    sizes: [
      { size: 'S', sku: `${apiProd.id}-S`, stock: 1, available: true },
      { size: 'M', sku: `${apiProd.id}-M`, stock: 1, available: true },
      { size: 'L', sku: `${apiProd.id}-L`, stock: 1, available: true },
      { size: 'XL', sku: `${apiProd.id}-XL`, stock: 1, available: true },
    ]
  }];

  return {
    id: apiProd.id,
    slug: apiProd.slug,
    name: apiProd.name,
    price: apiProd.price,
    original_price: apiProd.original_price,
    discount_percentage: apiProd.discount_percentage,
    // FALLBACK: Si la API no trae 'images', usamos 'main_image' dentro de un array
    images: apiProd.images || [apiProd.main_image], 
    category: apiProd.category,
    description: `Descubrí lo mejor en ${apiProd.category}. Calidad premium Pulso Wear.`, // Placeholder
    variants: (apiProd as any).variants || defaultVariants, // Prioriza si la API llegara a traer variantes
    active: true,
    tags: apiProd.badge || undefined,
  };
};