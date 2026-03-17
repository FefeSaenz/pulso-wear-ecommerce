import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
//import api from '../api/axios';
import { getFrontData } from '../api/axios';
import { FrontConfig, MenuItem } from '../types/api';
import { Product } from '../types/product.types'; // Ajustá la ruta si es necesario

interface AppContextType {
  frontConfig: FrontConfig | null;
  allProducts: Product[];
  menuItems: MenuItem[];
  logoText: string;
  loading: boolean;
  error: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  //const [data, setData] = useState<any | null>(null);
  const [frontConfig, setFrontConfig] = useState<FrontConfig | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Usamos la función que ya conoce el endpoint api.json
        const response = await getFrontData();

        if (response) {
          setFrontConfig(response.front);
          // Acceso exacto a la estructura del JSON
          setAllProducts(response.products.products || []);
          setError(false);
        }
      } catch (err) {
        console.error("Error cargando API en el inicio:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ 
      frontConfig,
      allProducts,
      menuItems: frontConfig?.menu?.items || [], // Facilitamos el acceso directo
      logoText: frontConfig?.menu?.logo?.text.toUpperCase() || "PULSO WEAR",
      loading, 
      error 
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