import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DailyDesktopEnvironments from '../pages/DailyDesktopEnvironments';

describe('Daily Desktop Environments Page', () => {
    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <DailyDesktopEnvironments />
            </MemoryRouter>
        );
        
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
