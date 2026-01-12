import { deepMerge } from '../../../utils/helpers';
import { UseGridApiContext } from './apiTypes';
import { GridApiUpdateState } from './gridApiUpdateState';
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
    rows.setInternalRowData(prev => {
        if (!state.pendingReset && state.pendingReplaceAll.length === 0 && state.pendingUpdates.size === 0 && state.pendingRemoves.size === 0 && state.pendingAdds.length === 0 && state.pendingUpAdds.length === 0) {
            return prev;
        }
        let next: any[] = [];
        if (state.pendingReplaceAll.length > 0) {
            next = [...state.pendingReplaceAll];
        } else if (state.pendingReset) {
            next = [];
        } else {
            next = [...prev];
        }
        if (state.pendingUpAdds.length > 0) {
            state.pendingUpAdds.forEach(upRow => {
                const id = getRowId ? getRowId(upRow) : (upRow as any).id;
                if (id !== undefined && id !== null) {
                    const exists = next.some(r => {
                        const rId = getRowId ? getRowId(r) : (r as any).id;
                        return String(rId) === String(id);
                    });
                    if (exists) {
                        state.pendingUpdates.set(String(id), upRow);
                    } else {
                        state.pendingAdds.push(upRow);
                    }
                } else {
                    state.pendingAdds.push(upRow);
                }
            });
        }
        if (state.pendingUpdates.size > 0) {
            state.pendingUpdates.forEach((newRowData, sId) => {
                const oldRowNode = rows.rowsRef.current.find(r => String(r.id) === sId);
                if (oldRowNode) {
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
            next = next.map(row => {
                const id = getRowId ? getRowId(row) : (row as any).id;
                const sId = String(id);
                if (state.pendingUpdates.has(sId)) {
                    return deepMerge(row, state.pendingUpdates.get(sId));
                }
                return row;
            });
        }
        if (state.pendingRemoves.size > 0) {
            next = next.filter(row => {
                const id = getRowId ? getRowId(row) : (row as any).id;
                return !state.pendingRemoves.has(String(id));
            });
        }
        if (state.pendingAdds.length > 0) {
            next = [...next, ...state.pendingAdds];
        }
        return next;
    });
}
