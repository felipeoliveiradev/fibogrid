import { GridManagerBuilder } from '../../../../../../types';
import { deepMerge } from '../../../../../../utils/helpers';
import { UseGridApiContext } from '../../../apiTypes';
import { createInitialUpdateState } from '../../../gridApiUpdateState';
import { executeGridUpdates } from '../../../gridApiExecutor';

/**
 * Coalesces high-frequency row patches into ONE `executeGridUpdates` per animation frame.
 *
 * `api.manager()` / `api.params()` build a fresh builder (and fresh pending state) on every call,
 * so coalescing state cannot live on the builder. It is keyed by `context.apiRef`, which is the
 * one object that stays stable for the lifetime of a grid instance.
 */
interface BatchUpdateSlot {
    patches: Map<string, any>;
    idKey?: string;
    handle: number | null;
    usesTimeout: boolean;
    getContext: () => UseGridApiContext<any>;
}

const slots = new WeakMap<object, BatchUpdateSlot>();

function readSlot(key: object, getContext: () => UseGridApiContext<any>): BatchUpdateSlot {
    let slot = slots.get(key);
    if (!slot) {
        slot = { patches: new Map(), idKey: undefined, handle: null, usesTimeout: false, getContext };
        slots.set(key, slot);
    }
    // Latest caller wins so the flush always runs against the freshest context.
    slot.getContext = getContext;
    return slot;
}

function cancelScheduled(slot: BatchUpdateSlot): void {
    if (slot.handle === null) return;
    if (slot.usesTimeout) clearTimeout(slot.handle);
    else cancelAnimationFrame(slot.handle);
    slot.handle = null;
}

function runSlot(slot: BatchUpdateSlot): void {
    slot.handle = null;
    if (slot.patches.size === 0) return;
    const patches = slot.patches;
    const idKey = slot.idKey;
    slot.patches = new Map();
    const state = createInitialUpdateState();
    state.pendingUpdates = patches;
    if (idKey) state.idKey = idKey;
    executeGridUpdates(slot.getContext(), state);
}

function schedule(slot: BatchUpdateSlot): void {
    if (slot.handle !== null) return;
    if (typeof requestAnimationFrame === 'function') {
        slot.usesTimeout = false;
        slot.handle = requestAnimationFrame(() => runSlot(slot));
    } else {
        slot.usesTimeout = true;
        slot.handle = setTimeout(() => runSlot(slot), 16) as unknown as number;
    }
}

/** Merge `rows` into the per-grid patch map and schedule a single rAF flush. */
export function enqueueBatchUpdate<T>(
    key: object,
    getContext: () => UseGridApiContext<T>,
    rows: Partial<T>[] | T[],
    getRowId?: (data: T) => string,
    idKey?: string
): void {
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        console.warn('Grid Manager: batchUpdate() requires a non-empty array of rows.');
        return;
    }
    const slot = readSlot(key, getContext);
    if (idKey) slot.idKey = idKey;
    let queued = false;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as T;
        let id: unknown;
        if (idKey) {
            id = (row as any)?.[idKey];
        } else if (getRowId) {
            try {
                id = getRowId(row);
            } catch {
                id = undefined;
            }
        } else {
            id = (row as any)?.id;
        }
        if (id === undefined || id === null) {
            console.warn('Grid Manager: batchUpdate() failed for row without ID:', row);
            continue;
        }
        const sId = String(id);
        const existing = slot.patches.get(sId);
        slot.patches.set(sId, existing === undefined ? row : deepMerge(existing, row));
        queued = true;
    }
    if (queued) schedule(slot);
}

/** Cancel the pending frame and apply every queued patch immediately. */
export function flushBatchUpdate(key: object): void {
    const slot = slots.get(key);
    if (!slot) return;
    cancelScheduled(slot);
    runSlot(slot);
}

export function batchUpdateManager<T>(
    context: UseGridApiContext<T>,
    managerBuilder: GridManagerBuilder<T>,
    rows: Partial<T>[] | T[],
    getRowId: (data: T) => string,
    idKey?: string
): GridManagerBuilder<T> {
    enqueueBatchUpdate(context.apiRef, () => context, rows, getRowId, idKey);
    return managerBuilder;
}

export function batchFlushManager<T>(
    context: UseGridApiContext<T>,
    managerBuilder: GridManagerBuilder<T>
): GridManagerBuilder<T> {
    flushBatchUpdate(context.apiRef);
    return managerBuilder;
}
