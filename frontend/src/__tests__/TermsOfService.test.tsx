import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import TermsOfService from '../pages/TermsOfService';

describe('Terms of Service Page', () => {
    it('renders the main terms of service title', () => {
        render(
            <MemoryRouter>
                <TermsOfService />
            </MemoryRouter>
        );
        
        expect(screen.getByText('_ > TERMS_OF_SERVICE')).toBeInTheDocument();
        expect(screen.getByText(/INTELLECTUAL PROPERTY RIGHTS/i)).toBeInTheDocument();
    });
});
