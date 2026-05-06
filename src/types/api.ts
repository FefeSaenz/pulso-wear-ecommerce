// types/api.ts

// ==========================================
// 1. TIPOS PARA LA UI (Para nuestro menú manual)
// ==========================================
export interface SubMenuItem {
  label: string;
  url: string;
}

export interface MenuItem {
  id: number;
  label: string;
  url: string;
  active: boolean;
  icon: string | null;
  submenu?: SubMenuItem[];
}

export interface Banner {
  id: string;
  type: 'hero' | 'promotional';
  title: string;
  subtitle: string;
  description: string;
  cta: { url: string; text: string };
  image: string;
  image_mobile?: string;
}
// ==========================================
// 2. TIPOS DE LA NUEVA API (El backend)
// ==========================================
export interface ApiVariant {
  variant_id: number;
  variant_hex: string;
  variant_sku: string;
  variant_size: string;
  variant_bound: number;
  variant_color: string;
  variant_stock: number | null;
  variant_picture: string;
}

export interface ApiDress {
  dress_bound: number;
  dress_slug: string;
  dress_name: string;
  dress_description: string;
  dress_material: string;
  dress_sku: string;
  dress_gender: number;
  dress_brand: number;
  dress_price: number;
  dress_highlight: number | null; // 1 = Destacado
  dress_pictures: string[];
  brand_name: string;
  category_name: string;
  category_abbreviation: string;
  dress_variants: ApiVariant[];
}

export interface ApiBanner {
  link_item_id: number;
  link_item_bound: number;
  link_item_type: string;
  link_item_picture: string;
  link_item_name: string;
  link_item_title: string;
  link_item_href: string;
}

export interface ApiResponse {
  status: number;
  error: boolean;
  msg: string;
  data: {
    banners: ApiBanner[]; 
    products: ApiDress[]; 
  };
}