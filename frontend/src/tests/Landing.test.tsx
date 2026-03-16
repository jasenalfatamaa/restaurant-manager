import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Landing from '../../pages/Landing';
import { ApiService } from '../../services/api';

// Mock useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedUsedNavigate,
    };
});

vi.mock('../../services/api', () => ({
    ApiService: {
        getTables: vi.fn(),
    }
}));

const mockTables = [
    { id: 1, number: 1, capacity: 4, status: 'AVAILABLE' },
    { id: 2, number: 2, capacity: 4, status: 'AVAILABLE' },
    { id: 3, number: 3, capacity: 4, status: 'AVAILABLE' },
    { id: 4, number: 4, capacity: 4, status: 'AVAILABLE' },
    { id: 5, number: 5, capacity: 4, status: 'AVAILABLE' },
];

describe('Landing Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(ApiService.getTables).mockResolvedValue(mockTables as any);
    });

    it('renders the landing page correctly', async () => {
        render(
            <MemoryRouter>
                <Landing />
            </MemoryRouter>
        );
        expect(screen.getByText('Rustic Roots')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getAllByText(/DEMO MODE/i).length).toBeGreaterThan(0);
        });
        expect(screen.getByText(/Select your table/i)).toBeInTheDocument();
    });

    it('enables the enter button only when a table is selected', async () => {
        render(
            <MemoryRouter>
                <Landing />
            </MemoryRouter>
        );
        const enterButton = screen.getByRole('button', { name: /Masuk/i });
        expect(enterButton).toBeDisabled();

        // Wait for tables to load
        const tableButton = await screen.findByText('5');
        fireEvent.click(tableButton);

        expect(enterButton).not.toBeDisabled();
    });

    it('navigates to welcome page on enter', async () => {
        render(
            <MemoryRouter>
                <Landing />
            </MemoryRouter>
        );
        // Wait for tables to load
        const tableButton = await screen.findByText('3');
        fireEvent.click(tableButton);

        const enterButton = screen.getByRole('button', { name: /Masuk/i });
        fireEvent.click(enterButton);

        expect(mockedUsedNavigate).toHaveBeenCalledWith('/welcome?table=3');
    });

    it('navigates to login page when staff access is clicked', async () => {
        render(
            <MemoryRouter>
                <Landing />
            </MemoryRouter>
        );
        const staffButton = screen.getByText(/STAFF \/ ADMIN ACCESS/i);
        fireEvent.click(staffButton);

        expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
    });
});
