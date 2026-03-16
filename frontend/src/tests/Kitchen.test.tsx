import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Kitchen from '../../pages/admin/Kitchen';
import { ApiService } from '../../services/api';
import { OrderStatus } from '../../types';

vi.mock('../../services/api', () => ({
    ApiService: {
        getOrders: vi.fn().mockResolvedValue([]),
    }
}));

const mockOrders = [
    {
        id: 'ORDER-123',
        tableId: 5,
        status: OrderStatus.PAID,
        timestamp: new Date(),
        total: 100000,
        items: [
            {
                name: 'Terracotta Chicken',
                quantity: 1,
                selectedModifiers: [{ name: 'French Fries', price: 10000 }],
                notes: 'Less spicy',
                finalPrice: 85000,
                price: 75000,
                category: 'Main',
                cartItemId: 'item-1',
                id: 1,
                description: 'Chicken',
                image: 'chicken.jpg'
            }
        ]
    }
];

describe('Kitchen View', () => {
    beforeEach(() => {
        vi.mocked(ApiService.getOrders).mockResolvedValue(mockOrders as any);
    });

    it('renders orders with modifiers and notes', async () => {
        render(<Kitchen />);

        const orderId = await screen.findByTestId('order-id');
        expect(orderId).toHaveTextContent('ORDER-123');
        expect(screen.getAllByText(/#5/).length).toBeGreaterThan(0);
        expect(screen.getByText(/Terracotta Chicken/)).toBeInTheDocument();
        expect(screen.getByText(/French Fries/)).toBeInTheDocument();
        expect(screen.getByText(/Less spicy/)).toBeInTheDocument();
    });

    it('shows NEW ORDER status for PAID orders', async () => {
        render(<Kitchen />);
        await waitFor(() => {
            expect(screen.getAllByText('NEW ORDER')).toHaveLength(2); // One for mobile, one for desktop logic in view
        });
    });
});
