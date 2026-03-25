import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import About from './About';

describe('About Page', () => {
    it('renders the main about title', () => {
        render(
            <MemoryRouter>
                <About />
            </MemoryRouter>
        );
        
        expect(screen.getByText('_ > ABOUT_LINUXDLE')).toBeInTheDocument();
        expect(screen.getByText(/MODULES_AND_GAMEPLAY/i)).toBeInTheDocument();
        expect(screen.getByText(/FREQUENTLY_ASKED_QUESTIONS/i)).toBeInTheDocument();
    });
});
