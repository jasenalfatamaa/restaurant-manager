import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Menu from '../../pages/customer/Menu';
import { CartProvider } from '../../context/CartContext';
import { ApiService } from '../../services/api';

// Mock ApiService
vi.mock('../../services/api', () => ({
    ApiService: {
        getProducts: vi.fn(),
        getCustomerOrders: vi.fn().mockResolvedValue([]),
        getLocationConfig: vi.fn().mockResolvedValue({ isActive: false })
    }
}));

const mockProducts = [
    {
        id: 1,
        name: 'Avocado Toast',
        description: 'Healthy toast',
        price: 45000,
        category: 'Breakfast',
        image: 'toast.jpg',
        modifierGroups: [
            {
                id: 'egg',
                name: 'Egg Type',
                minSelection: 1,
                maxSelection: 1,
                options: [{ id: 'e1', name: 'Fried', price: 5000 }]
            }
        ]
    },
    {
        id: 2,
        name: 'Espresso',
        description: 'Strong coffee',
        price: 25000,
        category: 'Drinks',
        image: 'coffee.jpg',
        modifierGroups: []
    }
];

describe('Menu Page', () => {
    beforeEach(() => {
        vi.spyOn(ApiService, 'getProducts').mockResolvedValue(mockProducts as any);
    });

    it('renders products correctly', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <Menu />
                </CartProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Avocado Toast')).toBeInTheDocument();
            expect(screen.getByText('Espresso')).toBeInTheDocument();
        });
    });

    it('filters products by category', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <Menu />
                </CartProvider>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Avocado Toast'));

        const categorySelect = screen.getByRole('combobox');
        fireEvent.change(categorySelect, { target: { value: 'Drinks' } });

        await waitFor(() => {
            expect(screen.queryByText('Avocado Toast')).not.toBeInTheDocument();
            expect(screen.getByText('Espresso')).toBeInTheDocument();
        });
    });

    it('searches products correctly', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <Menu />
                </CartProvider>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Avocado Toast'));

        const searchInput = screen.getByPlaceholderText(/Cari menu/i);
        fireEvent.change(searchInput, { target: { value: 'Coffee' } });

        await waitFor(() => {
            expect(screen.queryByText('Avocado Toast')).not.toBeInTheDocument();
            expect(screen.getByText('Espresso')).toBeInTheDocument();
        });
    });

    it('validates mandatory options in modal', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <Menu />
                </CartProvider>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Avocado Toast'));

        // Click the card
        fireEvent.click(screen.getByText('Avocado Toast'));

        // Wait for modal
        await waitFor(() => screen.getByText('Egg Type'));

        const addButton = screen.getByRole('button', { name: /ADD ORDER/i });
        expect(addButton).toBeDisabled();

        // Select the mandatory option
        fireEvent.click(screen.getByText('Fried'));

        expect(addButton).not.toBeDisabled();
    });
});
