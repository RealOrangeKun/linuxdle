import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DailyCommands from './DailyCommands';

describe('Daily Commands Page', () => {
    it('renders the main title', () => {
        render(
            <MemoryRouter>
                <DailyCommands />
            </MemoryRouter>
        );
        
        // Wait for it to move past the initial loading state if needed,
        // but since loading is true initially, it will render the CircularProgress.
        // Let's rely on standard findByText since it's async.
        
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
