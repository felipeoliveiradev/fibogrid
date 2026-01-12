import { GridApiBuilder, GridManagerBuilder } from '../../../types';
import { UseGridApiContext } from './apiTypes';
import { createInitialUpdateState } from './gridApiUpdateState';
import {
    addManager,
    upAddManager,
    replaceAllManager,
    removeManager,
    updateManager,
    updateCellManager,
    resetCellManager,
    resetRowManager,
    resetManager,
    resetEditsManager,
    setSelectionDataManager,
    splitManager,
    executeManager
} from "./gridApi/manager";
import {
    setFilterModelBase,
    removeFilterBase,
    removeAllFilterBase,
    setQuickFilterBase,
    removeQuickFilterBase,
    setSortModelBase,
    removeSortBase,
    removeAllSortBase,
    setPaginationBase,
    setPageBase,
    setPageSizeBase,
    selectRowsBase,
    selectRowBase,
    selectAllBase,
    deselectAllBase,
    updateRowDataBase,
    resetStateBase,
    resetEditsBase,
    resetCellBase,
    resetRowBase,
    executeBase
} from "./gridApi/base";
export function createGridApiBuilder<T>(context: UseGridApiContext<T>): GridApiBuilder<T> {
    const { getRowId } = context.props;
    const state = createInitialUpdateState();
    const builder: GridApiBuilder<T> = {
        setFilterModel: (model, options) => setFilterModelBase(state, builder, model, options),
        removeFilter: (field) => removeFilterBase(state, builder, field),
        removeAllFilter: () => removeAllFilterBase(state, builder),
        setQuickFilter: (text) => setQuickFilterBase(state, builder, text),
        removeQuickFilter: () => removeQuickFilterBase(state, builder),
        setSortModel: (model) => setSortModelBase(state, builder, model),
        removeSort: (field) => removeSortBase(state, builder, field),
        removeAllSort: () => removeAllSortBase(state, builder),
        setPagination: (s) => setPaginationBase(state, builder, s),
        setPage: (page) => setPageBase(state, builder, page),
        setPageSize: (size) => setPageSizeBase(state, builder, size),
        selectRows: (ids, selected) => selectRowsBase(state, builder, ids, selected),
        selectRow: (id, selected) => selectRowBase(state, builder, id, selected),
        selectAll: () => selectAllBase(state, builder),
        deselectAll: () => deselectAllBase(state, builder),
        updateRowData: (updates) => updateRowDataBase(state, builder, updates, getRowId!),
        resetState: () => resetStateBase(state, builder),
        resetEdits: () => resetEditsBase(state, builder),
        resetCell: (rowId, field) => resetCellBase(state, builder, rowId, field),
        resetRow: (rowId) => resetRowBase(state, builder, rowId),
        gridManager: (callback) => {
            let currentKey: string | undefined;
            let isMergeUnique = false;
            const managerBuilder: GridManagerBuilder<T> = {
                add: (rows) => addManager(state, managerBuilder, builder, rows),
                upAdd: (rows) => upAddManager(state, managerBuilder, rows),
                key: (keyName) => {
                    currentKey = keyName;
                    return managerBuilder;
                },
                mergeUnique: (enable = true) => {
                    isMergeUnique = enable;
                    return managerBuilder;
                },
                replaceAll: (rows, compareKey) => replaceAllManager(state, managerBuilder, rows, context.rows.rowsRef.current.map(r => r.data), compareKey || currentKey),
                remove: (rowIds) => removeManager(state, managerBuilder, rowIds, context.rows.rowsRef.current.map(r => r.data), currentKey),
                update: (rows) => updateManager(state, managerBuilder, rows, getRowId!, currentKey),
                updateCell: (rowId, field, value) => updateCellManager(state, managerBuilder, rowId, field, value),
                resetCell: (rowId, field) => resetCellManager(state, managerBuilder, rowId, field),
                resetRow: (rowId) => resetRowManager(state, managerBuilder, rowId),
                reset: () => resetManager(state, managerBuilder),
                resetEdits: () => resetEditsManager(state, managerBuilder),
                setSelectionData: (data) => setSelectionDataManager(state, managerBuilder, data, context.selection, context.rows, getRowId!),
                split: (rowId, options) => {
                    if (context.apiRef.current) {
                        splitManager(context.apiRef.current, rowId, context.rows.rowsRef.current, options);
                    }
                    return managerBuilder;
                },
                execute: () => executeManager(builder)
            };
            callback(managerBuilder);
            return builder;
        },
        execute: () => {
            executeBase(context, state);
        }
    };
    return builder;
}
