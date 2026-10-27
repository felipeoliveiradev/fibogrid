import { deepMerge } from '../../../utils/helpers';
import { GridApiUpdateState } from './gridApiUpdateState';
function readRowId<T>(row: T, getRowId?: (data: T) => string): unknown {
    if (getRowId) return getRowId(row);
    return (row as { id?: unknown }).id;
}
export function resolvePendingUpAdds<T>(
    state: GridApiUpdateState,
    existingRows: readonly T[],
    getRowId?: (data: T) => string,
    existingIndexById?: ReadonlyMap<string, number>,
): void {
    if (state.pendingUpAdds.length === 0) return;
    const queued = state.pendingUpAdds.splice(0, state.pendingUpAdds.length);
    queued.forEach(upRow => {
        const id = readRowId(upRow, getRowId);
        if (id !== undefined && id !== null) {
            const sId = String(id);
            const exists = existingIndexById
                ? existingIndexById.has(sId)
                : existingRows.some(row => String(readRowId(row, getRowId)) === sId);
            if (exists) {
                state.pendingUpdates.set(sId, upRow);
            } else {
                state.pendingAdds.push(upRow);
            }
        } else {
            state.pendingAdds.push(upRow);
        }
    });
}
export function applyRowMutations<T>(
    prev: readonly T[],
    state: GridApiUpdateState,
    getRowId?: (data: T) => string,
    options?: {
        emitCellChanges?: (rowId: string, newRowData: any) => void;
        rowIndexById?: ReadonlyMap<string, number>;
        /** When provided, ids of rows touched by pendingUpdates are pushed here. */
        outChangedIds?: string[];
    },
): T[] {
    if (!state.pendingReset && state.pendingReplaceAll.length === 0 && state.pendingUpdates.size === 0 && state.pendingRemoves.size === 0 && state.pendingAdds.length === 0 && state.pendingUpAdds.length === 0) {
        return prev as T[];
    }
    let next: T[];
    if (state.pendingReplaceAll.length > 0) {
        next = [...state.pendingReplaceAll] as T[];
    } else if (state.pendingReset) {
        next = [];
    } else {
        next = [...prev];
    }
    if (state.pendingUpdates.size > 0) {
        if (options?.emitCellChanges) {
            const emitCellChanges = options.emitCellChanges;
            state.pendingUpdates.forEach((newRowData, sId) => {
                emitCellChanges(sId, newRowData);
            });
        }
        const outChangedIds = options?.outChangedIds;
        if (outChangedIds) {
            state.pendingUpdates.forEach((_patch, sId) => {
                outChangedIds.push(sId);
            });
        }
        const indexById = options?.rowIndexById;
        if (indexById && !state.idKey && !state.pendingReset && state.pendingReplaceAll.length === 0) {
            let unresolved: Map<string, any> | null = null;
            state.pendingUpdates.forEach((patch, sId) => {
                const idx = indexById.get(sId);
                if (idx !== undefined && idx >= 0 && idx < next.length) {
                    next[idx] = deepMerge(next[idx], patch);
                } else {
                    if (!unresolved) unresolved = new Map();
                    unresolved.set(sId, patch);
                }
            });
            if (unresolved) {
                const fallbackMap = unresolved as Map<string, any>;
                next = next.map(row => {
                    const sId = String(readRowId(row, getRowId));
                    return fallbackMap.has(sId) ? deepMerge(row, fallbackMap.get(sId)) : row;
                });
            }
        } else {
            next = next.map(row => {
                const id = state.idKey ? (row as any)[state.idKey] : readRowId(row, getRowId);
                const sId = String(id);
                if (state.pendingUpdates.has(sId)) {
                    return deepMerge(row, state.pendingUpdates.get(sId));
                }
                return row;
            });
        }
    }
    if (state.pendingRemoves.size > 0) {
        next = next.filter(row => {
            const id = readRowId(row, getRowId);
            return !state.pendingRemoves.has(String(id));
        });
    }
    if (state.pendingAdds.length > 0) {
        next = [...next, ...(state.pendingAdds as T[])];
    }
    return next;
}
