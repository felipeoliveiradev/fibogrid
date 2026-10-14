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
    const writesServer = (props.paginationMode === 'server' || props.infiniteScroll) && Boolean(rows.serverSideState.updateData);
    const upAddExisting: readonly T[] = state.pendingReplaceAll.length > 0
        ? state.pendingReplaceAll as T[]
        : state.pendingReset
            ? []
            : writesServer
                ? rows.serverSideState.data
                : rows.internalRowData;
    resolvePendingUpAdds(state, upAddExisting, getRowId);
    const apply = (current: readonly T[]) => applyRowMutations(current, state, getRowId, {
        emitCellChanges: (sId, newRowData) => {
            const oldRowNode = rows.rowsRef.current.find(r => String(r.id) === sId);
            if (!oldRowNode) return;
            const oldData = oldRowNode.data as any;
            Object.keys(newRowData).forEach(key => {
                if (oldData[key] !== (newRowData as any)[key]) {
                    const column = columns.columns.find(c => c.field === key);
                    if (column && apiRef.current) {
                        events.fireEvent('cellValueChanged', {
                            rowNode: oldRowNode,
                            column,
                            field: key,
                            oldValue: oldData[key],
                            newValue: (newRowData as any)[key],
                            api: apiRef.current
                        });
                    }
                }
            });
        }
    });
    if (writesServer) {
        rows.serverSideState.updateData(currentData => apply(currentData));
    } else {
        rows.setInternalRowData(prev => apply(prev));
    }
}
