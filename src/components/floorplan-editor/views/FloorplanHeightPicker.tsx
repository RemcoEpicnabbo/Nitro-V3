import { FC } from 'react';
import { HEIGHT_BRUSH_MAX, HEIGHT_BRUSH_MIN } from '../state/constants';
import { tileFill } from '../state/selectors';

type Props = {
    selectedH: number;
    onSelect: (h: number) => void;
};

const SWATCH_W = 20;
const SWATCH_H = 14;

export const FloorplanHeightPicker: FC<Props> = ({ selectedH, onSelect }) =>
{
    const count = HEIGHT_BRUSH_MAX - HEIGHT_BRUSH_MIN + 1;
    const totalH = count * SWATCH_H;
    return (
        <div className="flex flex-col items-center">
            <span className="text-xs">{ selectedH }</span>
            <svg
                width={ SWATCH_W }
                height={ totalH }
                viewBox={ `0 0 ${ SWATCH_W } ${ totalH }` }
                className="shrink-0 select-none"
                role="listbox"
                aria-label="Brush height"
            >
                { Array.from({ length: count }, (_, i) =>
                {
                    const h = HEIGHT_BRUSH_MAX - i;
                    const y = i * SWATCH_H;
                    const fill = tileFill({ h, blocked: false });
                    const isSelected = selectedH === h;
                    return (
                        <rect
                            key={ h }
                            data-testid={ `swatch-${ h }` }
                            data-selected={ isSelected ? 'true' : 'false' }
                            x={ 0 }
                            y={ y }
                            width={ SWATCH_W }
                            height={ SWATCH_H }
                            fill={ fill }
                            stroke={ isSelected ? '#fff' : 'rgba(0,0,0,0.3)' }
                            strokeWidth={ isSelected ? 2 : 0.5 }
                            onClick={ () => onSelect(h) }
                            style={ { cursor: 'pointer' } }
                        />
                    );
                }) }
            </svg>
        </div>
    );
};
