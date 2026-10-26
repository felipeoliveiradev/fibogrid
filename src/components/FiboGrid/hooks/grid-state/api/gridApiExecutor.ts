import { UseGridApiContext } from './apiTypes';
import { GridApiUpdateState } from './gridApiUpdateState';
import { applyRowMutations, resolvePendingUpAdds } from './applyRowMutations';
export function executeGridUpdates<T>(context: UseGridApiContext<T>, state: GridApiUpdateState) {
    const {
        props,
        events,
        sortFilter,
        pagination,
        columns,
        rows,
        selection,
        apiRef
    } = context;
    const { getRowId } = props;
    if (state.pendingReset) {
        sortFilter.setFilterModel([]);
        sortFilter.setSortModel([]);
        sortFilter.setQuickFilter('');
        pagination.setPaginationState(prev => ({ ...prev, currentPage: 0 }));
        selection.setSelection(prev => ({ ...prev, selectedRows: new Set(), lastSelectedIndex: null, anchorIndex: null }));
        rows.setOverrides({});
    }
    if (state.pendingResetEdits) {
        rows.setOverrides({});
    }
    if (state.pendingResetCells.length > 0) {
        rows.setOverrides(prev => {
            const next = { ...prev };
            state.pendingResetCells.forEach(({ rowId, field }) => {
                if (next[rowId]) {
                    delete next[rowId][field];
                    if (Object.keys(next[rowId]).length === 0) {
                        delete next[rowId];
                    }
                }
            });
            return next;
        });
    }
    if (state.pendingResetRows.length > 0) {
        rows.setOverrides(prev => {
            const next = { ...prev };
            state.pendingResetRows.forEach(rowId => {
                delete next[rowId];
            });
            return next;
        });
    }
    if (state.filterUpdates.length > 0) {
        sortFilter.setFilterModel(prev => {
            let next = prev;
            state.filterUpdates.forEach(update => {
                next = update(next);
            });
            return next;
        });
    }
    if (state.pendingQuickFilter !== null) {
        sortFilter.setQuickFilter(state.pendingQuickFilter);
    }
    if (state.sortUpdates.length > 0) {
        sortFilter.setSortModel(prev => {
            let next = prev;
            state.sortUpdates.forEach(update => {
                next = update(next);
            });
            return next;
        });
    }
    if (state.pendingPage !== null || state.pendingPageSize !== null) {
        pagination.setPaginationState(prev => ({
            ...prev,
            currentPage: state.pendingPage ?? prev.currentPage,
            pageSize: state.pendingPageSize ?? prev.pageSize
        }));
    }
    if (state.pendingSelection) {
        const { mode, ids, selected } = state.pendingSelection;
        if (mode === 'all') {
            selection.selectAll();
        } else if (mode === 'none') {
            selection.deselectAll();
        } else {
            if (mode === 'single') {
                selection.selectRow(ids[0], selected);
            } else {
                selection.selectRows(ids, selected);
            }
        }
    }
    if (state.pendingReplaceAll.length > 0) {
        rows.setOverrides({});
    }
    const hasRowMutations =
        state.pendingReset
        || state.pendingReplaceAll.length > 0
        || state.pendingUpdates.size > 0
        || state.pendingRemoves.size > 0
        || state.pendingAdds.length > 0
        || state.pendingUpAdds.length > 0;
    if (!hasRowMutations) {
        return;
    }
    const writesServer = (props.paginationMode === 'server' || props.infiniteScroll) && Boolean(rows.serverSideState.updateData);
    const useExistingIndexMap =
        state.pendingReplaceAll.length === 0
        && !state.pendingReset
        && !writesServer;
    const upAddExisting: readonly T[] = state.pendingReplaceAll.length > 0
        ? state.pendingReplaceAll as T[]
        : state.pendingReset
            ? []
            : writesServer
                ? rows.serverSideState.data
                : rows.internalRowDataRef.current;
    resolvePendingUpAdds(
        state,
        upAddExisting,
        getRowId,
        useExistingIndexMap ? rows.rowIndexByIdRef.current : undefined,
    );
    const shouldEmitCellChanges = events.hasListeners('cellValueChanged');
    // Collect cell diffs during apply; fire AFTER setState so we never emit inside the updater
    // (StrictMode double-invokes updaters and stream ticks must stay cheap).
    const pendingCellEvents: Array<{
        rowNode: (typeof rows.rowsRef.current)[number];
        column: (typeof columns.columns)[number];
        field: string;
        oldValue: unknown;
        newValue: unknown;
    }> = [];
    const apply = (current: readonly T[]) => {
        // StrictMode may invoke the updater twice — keep only the last apply's diffs.
        pendingCellEvents.length = 0;
        return applyRowMutations(current, state, getRowId, {
            rowIndexById: rows.rowIndexByIdRef.current,
            emitCellChanges: shouldEmitCellChanges
                ? (() => {
                    const columnByField = new Map(columns.columns.map(c => [c.field, c]));
                    return (sId: string, newRowData: any) => {
                        const idx = rows.rowIndexByIdRef.current.get(sId);
                        const oldRowNode = idx !== undefined
                            ? rows.rowsRef.current[idx]
                            : rows.rowsRef.current.find(r => String(r.id) === sId);
                        if (!oldRowNode) return;
                        const oldData = oldRowNode.data as any;
                        const keys = Object.keys(newRowData);
                        for (let i = 0; i < keys.length; i++) {
                            const key = keys[i]!;
                            if (oldData[key] !== newRowData[key]) {
                                const column = columnByField.get(key);
                                if (column) {
                                    pendingCellEvents.push({
                                        rowNode: oldRowNode,
                                        column,
                                        field: key,
                                        oldValue: oldData[key],
                                        newValue: newRowData[key],
                                    });
                                }
                            }
                        }
                    };
                })()
                : undefined,
        });
    };
    if (writesServer) {
        rows.serverSideState.updateData(currentData => apply(currentData));
    } else {
        rows.setInternalRowData(prev => apply(prev));
    }
    if (pendingCellEvents.length > 0 && apiRef.current) {
        const api = apiRef.current;
        for (let i = 0; i < pendingCellEvents.length; i++) {
            const evt = pendingCellEvents[i]!;
            events.fireEvent('cellValueChanged', {
                rowNode: evt.rowNode,
                column: evt.column,
                field: evt.field,
                oldValue: evt.oldValue,
                newValue: evt.newValue,
                api,
            });
        }
    }
}
