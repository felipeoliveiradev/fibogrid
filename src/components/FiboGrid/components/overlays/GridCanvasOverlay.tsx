/**
 * GridCanvasOverlay — optional Canvas2D layer drawn *over* the DOM grid.
 *
 * Draws fading green/red rects for cells whose value just changed. The grid
 * itself stays DOM-based; this component is purely visual (pointer-events: none).
 *
 * The caller maps (rowId, field) → rect in overlay-local CSS pixels via
 * `getCellRect` (return null for cells that are not currently visible).
 * `getCellRect` is evaluated every animation frame while flashes are active, so
 * it can read live scroll offsets without re-rendering this component.
 */
import { memo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { FlashTracker } from '../../hooks/useCellFlashOverlay';

export interface FlashRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridCanvasOverlayProps {
  /** Overlay size in CSS pixels (usually the grid viewport size). */
  width: number;
  height: number;
  /** Tracker from `useCellFlashOverlay()` / `createFlashTracker()`. */
  tracker: FlashTracker;
  /** Cell → rect (overlay-local CSS px) or null if not visible. */
  getCellRect: (rowId: string | number, field: string) => FlashRect | null;
  /** RGB triplets "r,g,b". Defaults: green / red. */
  upColor?: string;
  downColor?: string;
  /** Peak alpha at flash start (default 0.35). */
  maxAlpha?: number;
  className?: string;
  style?: CSSProperties;
}

const STYLE_BASE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

function GridCanvasOverlayImpl({
  width,
  height,
  tracker,
  getCellRect,
  upColor = '34,197,94',
  downColor = '239,68,68',
  maxAlpha = 0.35,
  className,
  style,
}: GridCanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Latest props for the rAF loop without restarting it.
  const live = useRef({ getCellRect, upColor, downColor, maxAlpha, width, height });
  live.current = { getCellRect, upColor, downColor, maxAlpha, width, height };

  // DPR-aware backing store sizing.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
  }, [width, height]);

  // rAF loop runs only while there are live flashes.
  useEffect(() => {
    let raf = 0;

    const draw = () => {
      raf = 0;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const p = live.current;
      const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, p.width, p.height);

      const active = tracker.getActive();
      for (const f of active) {
        const r = p.getCellRect(f.rowId, f.field);
        if (!r) continue;
        const alpha = f.progress * p.maxAlpha;
        ctx.fillStyle = `rgba(${f.direction === 'up' ? p.upColor : p.downColor},${alpha.toFixed(3)})`;
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      // Keep going while anything is still fading; last frame leaves a clear canvas.
      if (active.length) raf = requestAnimationFrame(draw);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const unsubscribe = tracker.subscribe(kick);
    if (tracker.size()) kick();
    return () => {
      unsubscribe();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tracker]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ ...STYLE_BASE, width, height, ...style }}
    />
  );
}

export const GridCanvasOverlay = memo(GridCanvasOverlayImpl);
GridCanvasOverlay.displayName = 'GridCanvasOverlay';
