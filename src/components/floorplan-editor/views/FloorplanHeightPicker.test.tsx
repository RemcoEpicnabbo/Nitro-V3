import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { FloorplanHeightPicker } from './FloorplanHeightPicker';

describe('FloorplanHeightPicker', () =>
{
    it('renders 27 swatches', () =>
    {
        const { container } = render(<FloorplanHeightPicker selectedH={ 0 } onSelect={ () => {} } />);
        const swatches = container.querySelectorAll('[data-testid^="swatch-"]');
        expect(swatches).toHaveLength(27);
    });

    it('clicking a swatch fires onSelect with its height index', () =>
    {
        const onSelect = vi.fn();
        const { container } = render(<FloorplanHeightPicker selectedH={ 0 } onSelect={ onSelect } />);
        fireEvent.click(container.querySelector('[data-testid="swatch-5"]') as Element);
        expect(onSelect).toHaveBeenCalledWith(5);
    });

    it('marks the selected swatch with data-selected', () =>
    {
        const { container } = render(<FloorplanHeightPicker selectedH={ 12 } onSelect={ () => {} } />);
        expect(container.querySelector('[data-testid="swatch-12"]')?.getAttribute('data-selected')).toBe('true');
        expect(container.querySelector('[data-testid="swatch-0"]')?.getAttribute('data-selected')).toBe('false');
    });
});
