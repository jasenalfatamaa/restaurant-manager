import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartProvider, useCart } from '../../context/CartContext';
import { Product } from '../../types';

const mockProduct: Product = {
    id: 1,
    name: 'Test Coffee',
    description: 'Good coffee',
    price: 30000,
    category: 'Drinks',
    image: '',
    modifierGroups: []
};

describe('Cart Context & Logic', () => {
    it('adds items to cart correctly', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: ({ children }) => <CartProvider>{children}</CartProvider>
        });

        act(() => {
            result.current.addToCart(mockProduct, 1, [], 'No sugar please');
        });

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0].name).toBe('Test Coffee');
        expect(result.current.cart[0].notes).toBe('No sugar please');
    });

    it('handles smart quantity (addLastInstance)', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: ({ children }) => <CartProvider>{children}</CartProvider>
        });

        act(() => {
            result.current.addToCart(mockProduct, 1, []);
        });

        act(() => {
            result.current.addLastInstance(mockProduct);
        });

        expect(result.current.cart[0].quantity).toBe(2);
    });

    it('handles smart quantity (removeLastInstance)', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: ({ children }) => <CartProvider>{children}</CartProvider>
        });

        act(() => {
            result.current.addToCart(mockProduct, 2, []);
        });

        act(() => {
            result.current.removeLastInstance(mockProduct.id);
        });

        expect(result.current.cart[0].quantity).toBe(1);

        act(() => {
            result.current.removeLastInstance(mockProduct.id);
        });

        expect(result.current.cart).toHaveLength(0);
    });

    it('calculates total correctly', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: ({ children }) => <CartProvider>{children}</CartProvider>
        });

        act(() => {
            result.current.addToCart(mockProduct, 2, []);
        });

        expect(result.current.total).toBe(60000);
    });
});
