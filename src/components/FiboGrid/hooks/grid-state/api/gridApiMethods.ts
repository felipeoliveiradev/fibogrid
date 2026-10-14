import { GridApi, ProcessedColumn, RowNode } from '../../../types';
import { EventBuilder } from '../../../utils/EventBuilder';
import { exportToCsv, copyToClipboard, setValueAtPath, getValueFromPath, isEqual } from '../../../utils/helpers';
import { UseGridApiContext } from './apiTypes';
import type { GridHistoryEntry } from '../useGridRows';
const PASTE_ROW_LIMIT = 5000;
const HISTORY_LIMIT = 50;
function cloneCellOverrides(
    overrides: Record<string, Record<string, any>>,
): Record<string, Record<string, any>> {
    const next: Record<string, Record<string, any>> = {};
    const ids = Object.keys(overrides);
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]!;
        next[id] = { ...overrides[id] };
    }
    return next;
}
function applyCellHistory<T>(
    current: Record<string, Record<string, any>>,
    entry: Extract<GridHistoryEntry<T>, { kind: 'cell' }>,
): Record<string, Record<string, any>> {
    const next = { ...current };
    const row = { ...(next[entry.rowId] || {}) };
    if (!entry.hadField) {
        delete row[entry.field];
    } else {
        row[entry.field] = entry.previous;
    }
    if (Object.keys(row).length === 0) {
        delete next[entry.rowId];
    } else {
        next[entry.rowId] = row;
    }
    return next;
}
function cellHistoryFromOverrides(
    overrides: Record<string, Record<string, any>>,
    rowId: string,
    field: string,
): Extract<GridHistoryEntry<unknown>, { kind: 'cell' }> {
    const rowOverrides = overrides[rowId];
    const hadField = !!rowOverrides && Object.prototype.hasOwnProperty.call(rowOverrides, field);
    return {
        kind: 'cell',
        rowId,
        field,
        previous: hadField ? rowOverrides![field] : undefined,
        hadField,
    };
}
function pushHistoryEntry<T>(
    stack: GridHistoryEntry<T>[],
    entry: GridHistoryEntry<T>,
) {
    stack.push(entry);
    if (stack.length > HISTORY_LIMIT) {
        stack.splice(0, stack.length - HISTORY_LIMIT);
    }
}
function isNumericColumn(col: { cellEditor?: string; filterType?: string }): boolean {
    return col.cellEditor === 'number' || col.filterType === 'number';
}
function coercePastedValue(col: { cellEditor?: string; filterType?: string }, raw: string): unknown {
    if (!isNumericColumn(col)) return raw;
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : raw;
}
function canPasteIntoColumn<T>(
    col: ProcessedColumn<T>,
    data: T,
    rowNode: RowNode<T>,
    api: GridApi<T> | undefined,
): boolean {
    if (col.hide || col.editable === false) return false;
    if (typeof col.editable !== 'function') return true;
    if (!api) return true;
    return col.editable({
        value: getValueFromPath(data, col.field),
        data,
        rowIndex: rowNode.rowIndex,
        colDef: col,
        column: col,
        api,
        rowNode,
    }) !== false;
}
function writePastedValue<T>(
    row: T,
    col: ProcessedColumn<T>,
    newValue: unknown,
    api: GridApi<T> | undefined,
): T {
    if (!col.valueSetter || !api) {
        return setValueAtPath(row, col.field, newValue);
    }
    const draft = { ...row } as T;
    const oldValue = getValueFromPath(row, col.field);
    const accepted = col.valueSetter({
        oldValue,
        newValue,
        data: draft,
        column: col,
        api,
    });
    if (!accepted) return row;
    const written = getValueFromPath(draft, col.field);
    if (isEqual(written, oldValue) && !isEqual(newValue, oldValue)) {
        return setValueAtPath(draft, col.field, newValue);
    }
    return draft;
}
const AUTO_SIZE_PADDING = 24;
const AUTO_SIZE_MIN = 60;
const AUTO_SIZE_MAX = 480;
const AUTO_SIZE_ROW_LIMIT = 200;
const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const measureContext = measureCanvas ? measureCanvas.getContext('2d') : null;
function measureText(text: string): number {
    if (!measureContext) return 0;
    measureContext.font = '14px sans-serif';
    return measureContext.measureText(text).width;
}
function measureColumnWidth<T>(column: ProcessedColumn<T>, nodes: readonly RowNode<T>[]): number {
    let widest = measureText(column.headerName ?? '');
    const limit = nodes.length < AUTO_SIZE_ROW_LIMIT ? nodes.length : AUTO_SIZE_ROW_LIMIT;
    for (let i = 0; i < limit; i++) {
        const value = getValueFromPath(nodes[i].data, column.field);
        const text = value == null ? '' : String(value);
        const width = measureText(text);
        if (width > widest) widest = width;
    }
    const padded = Math.ceil(widest + AUTO_SIZE_PADDING);
    if (padded < AUTO_SIZE_MIN) return AUTO_SIZE_MIN;
    if (padded > AUTO_SIZE_MAX) return AUTO_SIZE_MAX;
    return padded;
}
function readFocusedCellAnchor(
    displayedLength: number,
    visibleCount: number,
): { rowIndex: number; colIndex: number } | null {
    if (typeof document === 'undefined' || visibleCount === 0) return null;
    const focused = document.querySelector('.fibogrid-cell-focused');
    if (!(focused instanceof HTMLElement)) return null;
    const rowEl = focused.closest('.group\\/row');
    if (!(rowEl instanceof HTMLElement) || !rowEl.parentElement) return null;
    const list = rowEl.parentElement;
    const translated = /translateY\(([-\d.]+)px\)/.exec(list.style.transform || '');
    const offsetTop = translated ? Number(translated[1]) : 0;
    const rowHeight = parseFloat(rowEl.style.height);
    if (!Number.isFinite(rowHeight) || rowHeight <= 0) return null;
    const startIndex = Math.round(offsetTop / rowHeight);
    const siblingIndex = Array.prototype.indexOf.call(list.children, rowEl);
    if (siblingIndex < 0) return null;
    const rowIndex = startIndex + siblingIndex;
    if (rowIndex < 0 || rowIndex >= displayedLength) return null;
    const wrappers = Array.from(rowEl.children).filter((child) =>
        child.querySelector('.fibogrid-cell-full-width')
    );
    if (wrappers.length !== visibleCount) return null;
    const wrapper = focused.parentElement;
    const colIndex = wrapper ? wrappers.indexOf(wrapper) : -1;
    if (colIndex < 0) return null;
    return { rowIndex, colIndex };
}
export function createGridApiMethods<T>(context: UseGridApiContext<T>): Partial<GridApi<T>> {
    const {
        props,
        events,
        sortFilter,
        pagination,
        columns,
        rows,
        selection,
        editing,
        apiRef,
        grouping
    } = context;
    const { paginationMode = 'client', infiniteScroll = false } = props;
    const isServerData = paginationMode === 'server' || infiniteScroll;
    const refreshRowNodes = () => {
        if (!isServerData) {
            rows.setInternalRowData(prev => prev.slice());
            return;
        }
        if (rows.serverSideState.updateData) {
            rows.serverSideState.updateData(data => data.slice());
        }
    };
    const writeColumnWidth = (field: string, width: number) => {
        columns.setColumnWidths(prev => {
            if (prev[field] === width) return prev;
            return { ...prev, [field]: width };
        });
    };
    return {
        addEventListener: events.addEventListener,
        removeEventListener: events.removeEventListener,
        events: () => new EventBuilder<T>(events.addEventListener, events.removeEventListener, events.fireEvent),
        getRowData: () => isServerData ? rows.serverSideState.data : rows.internalRowData,
        setRowData: (data) => {
            if (isEqual(data, rows.internalRowData)) return;
            rows.setInternalRowData(data);
        },
        updateRowData: (updates) => {
            if (!updates || (!updates.add && !updates.remove && !updates.update)) return;
            rows.setInternalRowData(prev => {
                let next = [...prev];
                if (updates.remove) {
                    const idsToRemove = new Set(updates.remove.map(r => props.getRowId ? props.getRowId(r) : (r as any).id));
                    next = next.filter(r => {
                        const id = props.getRowId ? props.getRowId(r) : (r as any).id;
                        return !idsToRemove.has(id);
                    });
                }
                if (updates.update) {
                    updates.update.forEach(u => {
                        const id = props.getRowId ? props.getRowId(u) : (u as any).id;
                        const idx = next.findIndex(r => (props.getRowId ? props.getRowId(r) : (r as any).id) === id);
                        if (idx >= 0) {
                            next[idx] = u;
                        }
                    });
                }
                if (updates.add) {
                    next = [...next, ...updates.add];
                }
                return next;
            });
        },
        getRowNode: (id) => {
            const node = rows.rowsRef.current.find((r) => r.id === id);
            if (!node) return null;
            const selected = selection.selectionRef.current.selectedRows.has(id);
            return { ...node, selected };
        },
        forEachNode: (callback) => rows.rowsRef.current.forEach(callback),
        getDisplayedRowCount: () => rows.displayedRowsRef.current.length,
        getDisplayedRowAtIndex: (index) => rows.displayedRowsRef.current[index] || null,
        getDisplayedRows: () => rows.displayedRowsRef.current,
        getSelectedRows: () => {
            const selectedIds = selection.selectionRef.current.selectedRows;
            return rows.sortedRowsRef.current.filter((r) => selectedIds.has(r.id));
        },
        getSelectedNodes: () => {
            const selectedIds = selection.selectionRef.current.selectedRows;
            return rows.sortedRowsRef.current.filter((r) => selectedIds.has(r.id));
        },
        selectAll: selection.selectAll,
        deselectAll: selection.deselectAll,
        /* Validation added to selectRow in usage or relying on useGridSelection check? 
           Let's add check here for redundancy or performance */
        selectRow: (id, selected = true) => {
            const isSelected = selection.selection.selectedRows.has(id);
            if (isSelected === selected) return;
            selection.selectRow(id, selected);
        },
        selectRows: (rowIds, selected = true) => {
            const allSatisfy = rowIds.every(id => selection.selection.selectedRows.has(id) === selected);
            if (allSatisfy) return;
            selection.selectRows(rowIds, selected);
        },
        getColumnDefs: () => columns.columns,
        setColumnVisible: (field, visible) => {
            columns.setHiddenColumns((prev) => {
                const isHidden = prev.has(field);
                if ((visible && !isHidden) || (!visible && isHidden)) return prev;
                const next = new Set(prev);
                if (visible) next.delete(field);
                else next.add(field);
                return next;
            });
        },
        setColumnPinned: columns.setColumnPinned,
        moveColumn: (fromIndex, toIndex) => {
            if (fromIndex === toIndex) return;
            columns.setColumnOrder((prev) => {
                const next = [...prev];
                const [moved] = next.splice(fromIndex, 1);
                next.splice(toIndex, 0, moved);
                return next;
            });
        },
        resizeColumn: (field, width) => {
            columns.setColumnWidths((prev) => {
                if (prev[field] === width) return prev;
                return { ...prev, [field]: width };
            });
        },
        autoSizeColumn: (field) => {
            const column = columns.columns.find(col => col.field === field);
            if (!column) return;
            writeColumnWidth(field, measureColumnWidth(column, rows.rowsRef.current));
        },
        autoSizeAllColumns: () => {
            const visible = columns.columns.filter(col => !col.hide);
            if (visible.length === 0) return;
            const nodes = rows.rowsRef.current;
            const measured: Record<string, number> = {};
            visible.forEach(col => {
                measured[col.field] = measureColumnWidth(col, nodes);
            });
            columns.setColumnWidths(prev => {
                let changed = false;
                const next = { ...prev };
                visible.forEach(col => {
                    const width = measured[col.field];
                    if (next[col.field] === width) return;
                    next[col.field] = width;
                    changed = true;
                });
                return changed ? next : prev;
            });
        },
        setPage: (page) => {
            pagination.setPaginationState((prev) => {
                const newPage = Math.max(0, Math.min(page, prev.totalPages - 1));
                if (prev.currentPage === newPage) return prev;
                return {
                    ...prev,
                    currentPage: newPage,
                };
            });
        },
        setPageSize: (size) => {
            pagination.setPaginationState((prev) => {
                if (prev.pageSize === size) return prev;
                return {
                    ...prev,
                    pageSize: size,
                    currentPage: 0,
                };
            });
        },
        nextPage: () => {
            pagination.setPaginationState((prev) => {
                const newPage = Math.min(prev.currentPage + 1, prev.totalPages - 1);
                if (prev.currentPage === newPage) return prev;
                return { ...prev, currentPage: newPage };
            });
        },
        previousPage: () => {
            pagination.setPaginationState((prev) => {
                const newPage = Math.max(prev.currentPage - 1, 0);
                if (prev.currentPage === newPage) return prev;
                return { ...prev, currentPage: newPage };
            });
        },
        setSortModel: (model) => {
            if (isEqual(model, sortFilter.sortModel)) return;
            sortFilter.setSortModel(model);
        },
        getSortModel: () => sortFilter.sortModel,
        setFilterModel: (model, options) => {
            let nextModel = model;
            if (options?.behavior === 'merge') {
                const currentModel = sortFilter.filterModel;
                const newModel = [...currentModel];
                model.forEach(newFilter => {
                    const existingIndex = newModel.findIndex(f => f.field === newFilter.field);
                    if (existingIndex >= 0) {
                        newModel[existingIndex] = newFilter;
                    } else {
                        newModel.push(newFilter);
                    }
                });
                nextModel = newModel;
            }
            if (isEqual(nextModel, sortFilter.filterModel)) return;
            sortFilter.setFilterModel(nextModel);
        },
        getFilterModel: () => sortFilter.filterModel,
        setQuickFilter: (text) => {
            if (sortFilter.quickFilter === text) return;
            sortFilter.setQuickFilter(text);
        },
        startEditingCell: editing.startEditingCell,
        stopEditing: editing.stopEditing,
        ensureRowVisible: (id) => {
            const node = rows.rowsRef.current.find(r => r.id === id)
                ?? rows.displayedRowsRef.current.find(r => r.id === id);
            if (!node) return;
        },
        ensureColumnVisible: (_field) => { },
        scrollTo: (_position) => { },
        exportToCsv: (params) => {
            const rowsToExport = params?.onlySelected
                ? rows.displayedRowsRef.current.filter((r) => selection.selection.selectedRows.has(r.id))
                : rows.displayedRowsRef.current;
            exportToCsv(rowsToExport, columns.columns, {
                fileName: params?.fileName,
                skipHeader: params?.skipHeader,
            });
        },
        copyToClipboard: async (includeHeaders = true) => {
            const selectedRows = rows.displayedRowsRef.current.filter((r) =>
                selection.selection.selectedRows.has(r.id)
            );
            const rowsToCopy = selectedRows.length > 0 ? selectedRows : rows.displayedRowsRef.current;
            await copyToClipboard(rowsToCopy, columns.columns, includeHeaders);
        },
        refreshCells: refreshRowNodes,
        redrawRows: refreshRowNodes,
        refresh: () => {
            if (isServerData) {
                pagination.setPaginationState((prev) => ({ ...prev, currentPage: 0 }));
                rows.serverSideState.refresh();
            } else {
                sortFilter.setFilterModel([]);
                sortFilter.setSortModel([]);
                sortFilter.setQuickFilter('');
                pagination.setPaginationState(prev => ({ ...prev, currentPage: 0 }));
            }
        },
        refreshSelection: () => {
            const currentSelected = Array.from(selection.selection.selectedRows);
            if (currentSelected.length === 0) return;
            selection.deselectAll();
            selection.selectRows(currentSelected, true);
        },
        undo: () => {
            const previous = rows.historyRef.current.pop();
            if (!previous) return;
            if (previous.kind === 'cell') {
                pushHistoryEntry(rows.redoHistoryRef.current, cellHistoryFromOverrides(
                    rows.overridesRef.current,
                    previous.rowId,
                    previous.field,
                ));
                rows.setOverrides((current) => applyCellHistory(current, previous));
                return;
            }
            pushHistoryEntry(rows.redoHistoryRef.current, {
                kind: 'snapshot',
                rows: rows.internalRowDataRef.current.slice(),
                overrides: cloneCellOverrides(rows.overridesRef.current),
            });
            rows.setInternalRowData(previous.rows);
            rows.setOverrides(previous.overrides);
        },
        redo: () => {
            const next = rows.redoHistoryRef.current.pop();
            if (!next) return;
            if (next.kind === 'cell') {
                pushHistoryEntry(rows.historyRef.current, cellHistoryFromOverrides(
                    rows.overridesRef.current,
                    next.rowId,
                    next.field,
                ));
                rows.setOverrides((current) => applyCellHistory(current, next));
                return;
            }
            pushHistoryEntry(rows.historyRef.current, {
                kind: 'snapshot',
                rows: rows.internalRowDataRef.current.slice(),
                overrides: cloneCellOverrides(rows.overridesRef.current),
            });
            rows.setInternalRowData(next.rows);
            rows.setOverrides(next.overrides);
        },
        pushUndoSnapshot: () => {
            pushHistoryEntry(rows.historyRef.current, {
                kind: 'snapshot',
                rows: rows.internalRowDataRef.current.slice(),
                overrides: cloneCellOverrides(rows.overridesRef.current),
            });
            rows.redoHistoryRef.current.length = 0;
        },
        pushCellUndo: (rowId: string, field: string) => {
            pushHistoryEntry(rows.historyRef.current, cellHistoryFromOverrides(
                rows.overridesRef.current,
                rowId,
                field,
            ));
            rows.redoHistoryRef.current.length = 0;
        },
        pasteFromClipboard: async () => {
            if (!(navigator.clipboard && navigator.clipboard.readText)) {
                console.warn('Clipboard API not available (readText).');
                return;
            }
            try {
                const text = await navigator.clipboard.readText();
                if (!text) return;
                const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const separator = normalized.includes('\t') ? '\t' : ',';
                const pastedRows = normalized.split('\n').filter(r => r.trim() !== '').slice(0, PASTE_ROW_LIMIT);
                if (pastedRows.length === 0) return;
                const visibleCols = columns.columns.filter(c => !c.hide);
                const displayed = rows.displayedRowsRef.current;
                const sorted = rows.sortedRowsRef.current;
                const visual = sorted.length > 0 ? sorted : displayed;
                const api = apiRef.current;
                const focused = readFocusedCellAnchor(displayed.length, visibleCols.length);
                const focusedRow = focused ? displayed[focused.rowIndex] : undefined;
                const focusedCol = focused ? visibleCols[focused.colIndex] : undefined;
                const editingCell = editing.editingCellRef.current;
                const selectedIds = selection.selectionRef.current.selectedRows;
                let anchor: { rowId: string; field: string } | null = null;
                if (focusedRow && focusedCol) {
                    anchor = { rowId: focusedRow.id, field: focusedCol.field };
                } else if (editingCell) {
                    anchor = { rowId: editingCell.rowId, field: editingCell.field };
                } else if (selectedIds.size > 0 && visibleCols[0]) {
                    const selectedRow = visual.find(r => selectedIds.has(r.id))
                        || displayed.find(r => selectedIds.has(r.id));
                    if (selectedRow) anchor = { rowId: selectedRow.id, field: visibleCols[0].field };
                }
                if (!anchor) return;
                let overlayRows = visual;
                let overlayStart = -1;
                let startCol = 0;
                if (anchor) {
                    overlayStart = visual.findIndex(r => r.id === anchor.rowId);
                    if (overlayStart < 0) {
                        overlayRows = displayed;
                        overlayStart = displayed.findIndex(r => r.id === anchor.rowId);
                    }
                    const fieldIndex = visibleCols.findIndex(c => c.field === anchor.field);
                    if (fieldIndex >= 0) startCol = fieldIndex;
                }
                const useOverlay = overlayStart >= 0;
                rows.setInternalRowData(prev => {
                    const history = [...prev];
                    const rowIdAt = (item: T, index: number) => props.getRowId ? props.getRowId(item) : `row-${index}`;
                    const indexById = new Map<string, number>();
                    prev.forEach((item, index) => indexById.set(rowIdAt(item, index), index));
                    const next = [...prev];
                    const appended: T[] = [];
                    let mutated = false;
                    const applyLine = (target: T, values: string[], rowNode: RowNode<T>): { row: T; wrote: boolean } => {
                        let updated = target;
                        let wrote = false;
                        for (let colOffset = 0; colOffset < values.length; colOffset++) {
                            const col = visibleCols[startCol + colOffset];
                            if (!col) break;
                            if (!canPasteIntoColumn(col, rowNode.data, rowNode, api)) continue;
                            const parsed = coercePastedValue(col, values[colOffset]);
                            const written = writePastedValue(updated, col, parsed, api);
                            if (written !== updated) {
                                updated = written;
                                wrote = true;
                            }
                        }
                        return { row: updated, wrote };
                    };
                    const appendLine = (values: string[], rowIndex: number) => {
                        const seed = {} as T;
                        const rowNode: RowNode<T> = { id: '', data: seed, rowIndex, selected: false };
                        const applied = applyLine(seed, values, rowNode);
                        if (!applied.wrote) return;
                        const draft = applied.row;
                        if (!props.getRowId && !(draft as any).id) {
                            (draft as any).id = `pasted-${Date.now()}-${Math.random()}`;
                        }
                        appended.push(draft);
                        mutated = true;
                    };
                    if (useOverlay) {
                        pastedRows.forEach((rowStr, pasteIndex) => {
                            const values = rowStr.split(separator);
                            const node = overlayRows[overlayStart + pasteIndex];
                            if (!node) {
                                appendLine(values, overlayRows.length + pasteIndex);
                                return;
                            }
                            const internalIndex = indexById.get(node.id);
                            if (internalIndex === undefined) return;
                            const applied = applyLine(next[internalIndex], values, node);
                            if (!applied.wrote) return;
                            next[internalIndex] = applied.row;
                            mutated = true;
                        });
                    } else {
                        pastedRows.forEach((rowStr, pasteIndex) => {
                            appendLine(rowStr.split(separator), prev.length + pasteIndex);
                        });
                    }
                    if (!mutated) return prev;
                    pushHistoryEntry(rows.historyRef.current, {
                        kind: 'snapshot',
                        rows: history,
                        overrides: cloneCellOverrides(rows.overridesRef.current),
                    });
                    rows.redoHistoryRef.current.length = 0;
                    return appended.length > 0 ? [...next, ...appended] : next;
                });
            } catch (err) {
                console.warn('Failed to read from clipboard. Context might be insecure.', err);
            }
        },
        expandAllGroups: () => {
            grouping.expandAllGroups();
        },
        collapseAllGroups: () => {
            grouping.collapseAllGroups();
        },
        addChildToRow: grouping.addChildToRow,
    } as Partial<GridApi<T>>;
};
