import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Home from '../pages/Home';

describe('Home Page', () => {
    it('renders the main title and welcome text', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        
        expect(screen.getByText('_ > LINUXDLE')).toBeInTheDocument();
        expect(screen.getByText(/Welcome to the daily puzzle suite/i)).toBeInTheDocument();
    });

    it('renders all three game modules', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        
        expect(screen.getByText('[+] ./daily-commands')).toBeInTheDocument();
        expect(screen.getByText('[+] ./daily-distros')).toBeInTheDocument();
        expect(screen.getByText('[+] ./daily-desktop-environments')).toBeInTheDocument();
    });
});
