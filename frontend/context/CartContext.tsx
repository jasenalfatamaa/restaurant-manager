import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, Modifier } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, modifiers: Modifier[], notes?: string) => void;
  removeLastInstance: (productId: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateItemQuantity: (cartItemId: string, delta: number) => void;
  updateCartItem: (cartItemId: string, modifiers: Modifier[], quantity: number, notes?: string) => void;
  addLastInstance: (product: Product) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number, modifiers: Modifier[], notes?: string) => {
    const modifierTotal = modifiers.reduce((sum, mod) => sum + mod.price, 0);
    const finalPrice = product.price + modifierTotal;

    const newItem: CartItem = {
      ...product,
      cartItemId: `item-${Date.now()}-${Math.random()}`,
      quantity: quantity,
      selectedModifiers: modifiers,
      notes: notes,
      finalPrice: finalPrice
    };

    setCart((prev) => [...prev, newItem]);
  };

  // Remove the most recently added instance of a specific product ID (Used for the "-" button on Menu Card)
  const removeLastInstance = (productId: number) => {
    setCart((prev) => {
      // Find the last index of this product
      const lastIndex = prev.map(item => item.id).lastIndexOf(productId);

      if (lastIndex === -1) return prev;

      const targetItem = prev[lastIndex];

      if (targetItem.quantity > 1) {
        // If quantity is > 1, just decrement it
        const newCart = [...prev];
        newCart[lastIndex] = { ...targetItem, quantity: targetItem.quantity - 1 };
        return newCart;
      } else {
        // If quantity is 1, remove the item completely
        const newCart = [...prev];
        newCart.splice(lastIndex, 1);
        return newCart;
      }
    });
  };

  // Remove specific item (Used in Checkout)
  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Duplicate the last instance of a product (Used for the "+" button on Menu Card)
  const addLastInstance = (product: Product) => {
    setCart((prev) => {
      const lastIndex = prev.map(item => item.id).lastIndexOf(product.id);
      if (lastIndex === -1) {
        // If not in cart, add fresh
        addToCart(product, 1, [], undefined);
        return prev;
      }

      const targetItem = prev[lastIndex];
      const newCart = [...prev];
      newCart[lastIndex] = { ...targetItem, quantity: targetItem.quantity + 1 };
      return newCart;
    });
  };

  // Update modifiers/quantity/notes of a specific cart item
  const updateCartItem = (cartItemId: string, modifiers: Modifier[], quantity: number, notes?: string) => {
    setCart((prev) => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const modifierTotal = modifiers.reduce((sum, mod) => sum + mod.price, 0);
        return {
          ...item,
          selectedModifiers: modifiers,
          quantity: quantity,
          notes: notes,
          finalPrice: item.price + modifierTotal
        };
      }
      return item;
    }));
  };

  // Update specific item quantity (Used in Checkout)
  const updateItemQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeLastInstance, removeFromCart, updateItemQuantity, updateCartItem, addLastInstance, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};