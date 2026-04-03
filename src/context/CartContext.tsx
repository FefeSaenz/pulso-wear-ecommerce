import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, CartItem, Order } from '../types/product.types';

interface CartContextType {
  cart: CartItem[];
  orders: Order[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, size: string, delta: number) => void;
  removeFromCart: (id: string, size: string) => void;
  handleCheckoutComplete: (newOrder: Order) => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // --- ESTADOS DE INTERFAZ (Modales movidos a Context para acceso global) ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // --- ESTADOS DE NEGOCIO (Carrito y Pedidos) ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  /*
    MANEJADORES DEL CARRITO
    Usamos useCallback para que las funciones no se recreen si no cambian sus dependencias.
   */
  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === newItem.id && item.selectedSize === newItem.selectedSize && item.selectedColor === newItem.selectedColor);
      if (existing) {
        return prev.map((item) =>
          (item.id === newItem.id && item.selectedSize === newItem.selectedSize && item.selectedColor === newItem.selectedColor)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, newItem];
    });
    
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.selectedSize === size) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.selectedSize === size)));
  }, []);

  /*
    FINALIZACIÓN DE COMPRA
    Registra el nuevo pedido y limpia el carrito de compras.
   */
  const handleCheckoutComplete = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsCheckoutOpen(false);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, orders, isCartOpen, setIsCartOpen, isProfileOpen, setIsProfileOpen,
      isCheckoutOpen, setIsCheckoutOpen, addToCart, updateQuantity, 
      removeFromCart, handleCheckoutComplete, cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};