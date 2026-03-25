import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DailyDistros from './DailyDistros';

describe('Daily Distros Page', () => {
    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <DailyDistros />
            </MemoryRouter>
        );
        
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
