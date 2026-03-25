import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PrivacyPolicy from './PrivacyPolicy';

describe('Privacy Policy Page', () => {
    it('renders the main privacy policy title', () => {
        render(
            <MemoryRouter>
                <PrivacyPolicy />
            </MemoryRouter>
        );
        
        expect(screen.getByText('_ > PRIVACY_POLICY')).toBeInTheDocument();
        expect(screen.getByText(/WHAT INFORMATION DO WE COLLECT/i)).toBeInTheDocument();
    });
});
