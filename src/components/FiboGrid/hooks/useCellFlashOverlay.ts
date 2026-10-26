/**
 * Cell flash tracking for stream/"trading terminal" visuals.
 *
 * Framework-agnostic core (`createFlashTracker`) + a thin React hook
 * (`useCellFlashOverlay`). The tracker only stores *which* cell flashed, *when*
 * and in *which direction*; drawing is done by `GridCanvasOverlay`.
 */
import { useEffect, useMemo } from 'react';

export type FlashDirection = 'up' | 'down';

export interface CellFlashEvent {
  rowId: string | number;
  field: string;
  direction: FlashDirection;
}

export interface ActiveFlash extends CellFlashEvent {
  /** performance.now() timestamp when the flash started. */
  startedAt: number;
  /** 1 → 0 linear fade (caller applies maxAlpha / easing). */
  progress: number;
}

export interface FlashTrackerOptions {
  /** Fade duration in ms. Default 250. */
  duration?: number;
  /** Clock override (tests). Default performance.now. */
  now?: () => number;
}

export interface FlashTracker {
  readonly duration: number;
  /** Start (or restart) a flash for a cell. Notifies subscribers. */
  notifyFlash(event: CellFlashEvent): void;
  /** Subscribe to new flashes / clear. Returns unsubscribe. */
  subscribe(cb: () => void): () => void;
  /**
   * Stable snapshot (same reference until a flash is added/removed) — safe for
   * `useSyncExternalStore`. Entries expire lazily via `getActive`.
   */
  getSnapshot(): readonly CellFlashEvent[];
  /** Returns non-expired flashes with their fade progress; prunes expired ones. */
  getActive(now?: number): ActiveFlash[];
  /** Number of live (not yet pruned) flashes. */
  size(): number;
  clear(): void;
}

const keyOf = (rowId: string | number, field: string) => `${rowId}\u0000${field}`;
const defaultNow = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export function createFlashTracker(options: FlashTrackerOptions = {}): FlashTracker {
  const duration = options.duration ?? 250;
  const now = options.now ?? defaultNow;
  const flashes = new Map<string, { event: CellFlashEvent; startedAt: number }>();
  const listeners = new Set<() => void>();
  let snapshot: readonly CellFlashEvent[] = [];

  const rebuild = () => {
    snapshot = Array.from(flashes.values(), (f) => f.event);
  };
  const emit = () => listeners.forEach((cb) => cb());

  return {
    duration,
    notifyFlash(event) {
      // Re-flashing the same cell restarts the fade (and may flip colour).
      flashes.set(keyOf(event.rowId, event.field), { event, startedAt: now() });
      rebuild();
      emit();
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot: () => snapshot,
    getActive(t = now()) {
      const out: ActiveFlash[] = [];
      let pruned = false;
      flashes.forEach((f, key) => {
        const progress = 1 - (t - f.startedAt) / duration;
        if (progress <= 0) {
          flashes.delete(key);
          pruned = true;
        } else {
          out.push({ ...f.event, startedAt: f.startedAt, progress: Math.min(1, progress) });
        }
      });
      if (pruned) rebuild(); // silent: pruning is not a new visual event
      return out;
    },
    size: () => flashes.size,
    clear() {
      if (!flashes.size) return;
      flashes.clear();
      rebuild();
      emit();
    },
  };
}

/**
 * React hook: creates a stable tracker for the component lifetime.
 * Pass `tracker` to `<GridCanvasOverlay tracker={tracker} />` and call
 * `notifyFlash` whenever a streamed value changes.
 */
export function useCellFlashOverlay(options: FlashTrackerOptions = {}) {
  const duration = options.duration ?? 250;
  // Options other than duration (clock) are intentionally read once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tracker = useMemo(() => createFlashTracker(options), [duration]);
  useEffect(() => () => tracker.clear(), [tracker]);
  return {
    tracker,
    notifyFlash: tracker.notifyFlash,
    subscribe: tracker.subscribe,
    getSnapshot: tracker.getSnapshot,
  };
}
