'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '@/app/services/api';
import { CartItemRes, CartRes } from '../types/dto/cart';

export interface CartItem {
  currentUnitPrice: number;
  itemId: number;
  lineTotal: number;
  priceChanged: boolean;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceSnapshot: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, delta: number) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartData, setCartData] = useState<CartRes | null>(null);
  const totalPrice: number = cartData?.subtotal || 0;
  const totalItems: number = cartData?.items?.length || 0;

  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      setCartData(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    fetchCart(); 
  }, []);

  const addItem = async (productId: number, quantity: number = 1) => {
    const updated = await cartApi.addItem(productId, quantity);
    setCartData(updated);
  };

  const updateQuantity = async (itemId: number, delta: number) => {
    const item = cartData?.items?.find((i: CartItemRes) => i.itemId === itemId);
    if (!item) return;
    const updated = await cartApi.updateItem(itemId, item.quantity + delta);
    setCartData(updated);
  };

  const removeItem = async (itemId: number) => {
    const updated = await cartApi.removeItem(itemId);
    setCartData(updated);
  };

  const clearCart = () => {
    // totalItems = 0;
    // totalPrice = 0;
    setCartData(null);
  }

  return (
    <CartContext.Provider value={{ 
      cart: cartData?.items || [], 
      totalPrice: totalPrice,
      totalItems: totalItems,
      addItem, 
      removeItem, 
      updateQuantity,
      clearCart
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};