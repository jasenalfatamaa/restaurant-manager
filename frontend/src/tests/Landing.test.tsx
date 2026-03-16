import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Landing from '../../pages/Landing';

// Mock useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedUsedNavigate,
    };
});

describe('Landing Page', () => {
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

    it('enables the enter button only when a table is selected', () => {
        render(
            <MemoryRouter>
                <Landing />
            </MemoryRouter>
        );
        const enterButton = screen.getByRole('button', { name: /Masuk/i });
        expect(enterButton).toBeDisabled();

        const tableButton = screen.getByText('5');
        fireEvent.click(tableButton);

        expect(enterButton).not.toBeDisabled();
    });

    it('navigates to welcome page on enter', () => {
        render(
            <MemoryRouter>
                <Landing />
            </MemoryRouter>
        );
        const tableButton = screen.getByText('3');
        fireEvent.click(tableButton);

        const enterButton = screen.getByRole('button', { name: /Masuk/i });
        fireEvent.click(enterButton);

        expect(mockedUsedNavigate).toHaveBeenCalledWith('/welcome?table=3');
    });

    it('navigates to login page when staff access is clicked', () => {
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
