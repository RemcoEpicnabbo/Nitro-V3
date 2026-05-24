import { FC, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HEIGHT_BRUSH_MAX, HEIGHT_BRUSH_MIN } from '../state/constants';
import { tileFill } from '../state/selectors';

type Props = {
    selectedH: number;
    onSelect: (h: number) => void;
};

const TRACK_W = 14;
const TRACK_H = 260;
const THUMB_DIAM = 24;

/**
 * Vertical brush-height slider. The track is a top-down gradient
 * built from the real tile-fill colours, so the user still sees
 * which colour maps to which height — the swatch column it
 * replaces communicated the same mapping a swatch at a time.
 * The thumb shows the currently picked height as a number and is
 * fully drag-aware (click anywhere on the track to jump, then
 * drag without releasing).
 */
export const FloorplanHeightPicker: FC<Props> = ({ selectedH, onSelect }) =>
{
    const count = HEIGHT_BRUSH_MAX - HEIGHT_BRUSH_MIN + 1;
    const trackRef = useRef<HTMLDivElement>(null);
    const [ isDragging, setIsDragging ] = useState(false);

    // Top of the gradient is HEIGHT_BRUSH_MAX (matches the legacy
    // swatch column layout). Each step is `100 / (count - 1)` % of
    // the track height. Building hard stops gives a discrete-step
    // gradient (clear band per height) rather than a smooth blend
    // — closer to the original swatches, easier for users to read.
    const gradient = useMemo(() =>
    {
        const stops: string[] = [];
        for(let i = 0; i < count; i++)
        {
            const h = HEIGHT_BRUSH_MAX - i;
            const fill = tileFill({ h, blocked: false });
            const startPct = (i / count) * 100;
            const endPct = ((i + 1) / count) * 100;

            stops.push(`${ fill } ${ startPct.toFixed(2) }%`);
            stops.push(`${ fill } ${ endPct.toFixed(2) }%`);
        }

        return `linear-gradient(to bottom, ${ stops.join(', ') })`;
    }, [ count ]);

    const heightFromClientY = useCallback((clientY: number): number | null =>
    {
        const track = trackRef.current;

        if(!track) return null;

        const rect = track.getBoundingClientRect();

        if(rect.height === 0) return null;

        const local = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        const idx = Math.round(local * (count - 1));

        return HEIGHT_BRUSH_MAX - idx;
    }, [ count ]);

    const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) =>
    {
        if(e.button !== 0) return;

        const next = heightFromClientY(e.clientY);

        if(next !== null && next !== selectedH) onSelect(next);

        setIsDragging(true);
    }, [ heightFromClientY, onSelect, selectedH ]);

    // While dragging, listen on window so the slider keeps tracking
    // even when the pointer leaves the narrow track strip.
    useEffect(() =>
    {
        if(!isDragging) return;

        const onMove = (e: PointerEvent) =>
        {
            const next = heightFromClientY(e.clientY);
            if(next !== null && next !== selectedH) onSelect(next);
        };
        const onUp = () => setIsDragging(false);

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);

        return () =>
        {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [ isDragging, heightFromClientY, onSelect, selectedH ]);

    // Thumb centre as a % of the track height. At selectedH ==
    // HEIGHT_BRUSH_MAX the thumb sits at 0 % (top), at the min it
    // sits at 100 % (bottom). Translating Y by -50 % then re-
    // centres the circle on that point.
    const thumbPct = ((HEIGHT_BRUSH_MAX - selectedH) / (count - 1)) * 100;

    return (
        <div
            className="relative shrink-0 select-none touch-none"
            style={ { width: THUMB_DIAM + 4, height: TRACK_H } }
            role="slider"
            aria-label="Altezza pennello"
            aria-valuemin={ HEIGHT_BRUSH_MIN }
            aria-valuemax={ HEIGHT_BRUSH_MAX }
            aria-valuenow={ selectedH }
        >
            <div
                ref={ trackRef }
                data-testid="height-track"
                className="absolute left-1/2 -translate-x-1/2 rounded-full border border-zinc-400 shadow-inner cursor-pointer overflow-hidden"
                style={ {
                    width: TRACK_W,
                    height: TRACK_H,
                    background: gradient
                } }
                onPointerDown={ onPointerDown }
            />
            <div
                data-testid="height-thumb"
                className={ `absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 border-2 ${ isDragging ? 'border-zinc-800' : 'border-zinc-700' } shadow-md flex items-center justify-center text-[10px] font-bold text-zinc-900 tabular-nums pointer-events-none` }
                style={ {
                    width: THUMB_DIAM,
                    height: THUMB_DIAM,
                    top: `${ thumbPct }%`
                } }
            >
                { selectedH }
            </div>
        </div>
    );
};
