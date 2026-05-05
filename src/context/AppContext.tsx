import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFrontData } from '../api/axios';
import { Product } from '../types/product.types';
import { mapApiDressToProduct, extractUniqueCategories } from '../utils/mappers';
import { MenuItem } from '../types/api';

interface AppContextType {
  allProducts: Product[];
  categories: string[]; // Guardamos las categorías reales por si las necesitas en filtros
  menuItems: MenuItem[];
  logoText: string;
  loading: boolean;
  error: boolean;
  frontConfig: any; // Mantenemos el tipado que pusiste
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Función para armar tu Menú de forma inteligente
const buildSmartMenu = (categories: string[]): MenuItem[] => {
  return [
    {
      id: 1,
      label: 'COLECCIONES',
      url: '/productos', // CORREGIDO: Lleva al catálogo general
      active: true,
      icon: null,
      // Metemos todas las categorías reales de la API adentro de un submenú
      submenu: categories.map(cat => ({
        label: cat,
        // Convertimos "Remera Oversize" a "remera-oversize" para la URL
        url: `/category/${cat.toLowerCase().replace(/\s+/g, '-')}` 
      }))
    },
    {
      id: 2,
      label: 'DESTACADOS',
      url: '/productos?filter=destacados', // CORREGIDO: Filtra los destacados
      active: false,
      icon: null
    },
    {
      id: 3,
      label: 'STORE',
      url: '/#locals-section', // CORREGIDO: Navega a la sección en la Home
      active: false,
      icon: null
    }
  ];
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [frontConfig, setFrontConfig] = useState<any>(null); // NUEVO ESTADO PARA BANNERS

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await getFrontData();

        if (response && response.products) {
          
          // Guardamos la respuesta cruda entera para que la Home lea los banners de la API
          setFrontConfig(response); 

          // 1. Pasamos los datos crudos por la máquina traductora
          const mappedProducts = response.products.map(mapApiDressToProduct);
          setAllProducts(mappedProducts);

          // 2. Extraemos las categorías reales para no inventarlas
          const uniqueCats = extractUniqueCategories(mappedProducts);
          setCategories(uniqueCats);

          // 3. Armamos el menú protegiendo el layout
          setMenuItems(buildSmartMenu(uniqueCats));
          
          setError(false);
        }
      } catch (err) {
        console.error("Error cargando el catálogo de la API:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ 
      allProducts,
      categories,
      menuItems,
      logoText: "PULSO WEAR",
      loading, 
      error,
      frontConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp debe usarse dentro de AppProvider");
  return context;
};