import { Product } from "./product.types";
// --- ÁTOMOS (Estructuras básicas que se repiten) ---

export interface Link {
  text?: string;
  label?: string;
  url: string;
}

export interface ImageSet {
  main: string;
  gallery: string[];
}

// --- LAYOUT (Menú y Banners) ---

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
  cta: Link;
  image: string;
  image_mobile?: string;
  background_color?: string;
  text_color?: string;
  start_date?: string;
  end_date?: string;
}

// --- PRODUCTOS ---

export interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  main_image: string;
  images?: string[];
  slug: string;
  badge?: string;
  url: string;
}

// --- ESTRUCTURA GLOBAL ---

export interface FrontConfig {
  menu: {
    logo: { text: string; url: string };
    items: MenuItem[];
  };
  banners: Banner[];
  featured_products: {
    section_title: string;
    section_subtitle: string;
    products: FeaturedProduct[];
  };
}

// Representa la respuesta completa de tu API
export interface ApiResponse {
  status: number;
  error: boolean;
  msg: string;
  data: {
    front: FrontConfig;
    products: {            // <--- Agregamos este objeto intermedio
      products: Product[]; // <--- El array está acá adentro
      meta?: any;          // Por si querés guardar el total_products, currency, etc.
    };
  };
}