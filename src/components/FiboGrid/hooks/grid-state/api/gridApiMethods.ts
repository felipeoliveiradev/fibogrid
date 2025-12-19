import { GridApi } from '../../../types';
import { EventBuilder } from '../../../utils/EventBuilder';
import { exportToCsv, copyToClipboard, setValueAtPath, isEqual } from '../../../utils/helpers';
import { UseGridApiContext } from './apiTypes';

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

    const { paginationMode = 'client' } = props;

    return {
        addEventListener: events.addEventListener,
        removeEventListener: events.removeEventListener,
        events: () => new EventBuilder<T>(events.addEventListener, events.removeEventListener, events.fireEvent),

        getRowData: () => paginationMode === 'server' ? rows.serverSideState.data : rows.internalRowData,
        setRowData: (data) => {
            if (isEqual(data, rows.internalRowData)) return;
            rows.setInternalRowData(data);
        },
        updateRowData: (updates) => {
            // Basic transaction implementation
            if (!updates || (!updates.add && !updates.remove && !updates.update)) return;

            rows.setInternalRowData(prev => {
                let next = [...prev];

                // Remove
                if (updates.remove) {
                    const idsToRemove = new Set(updates.remove.map(r => props.getRowId ? props.getRowId(r) : (r as any).id));
                    next = next.filter(r => {
                        const id = props.getRowId ? props.getRowId(r) : (r as any).id;
                        return !idsToRemove.has(id);
                    });
                }

                // Update
                if (updates.update) {
                    console.log('[Grid Debug] Processing updates:', updates.update.length);
                    updates.update.forEach(u => {
                        const id = props.getRowId ? props.getRowId(u) : (u as any).id;
                        const idx = next.findIndex(r => (props.getRowId ? props.getRowId(r) : (r as any).id) === id);

                        console.log('[Grid Debug] Update Row:', { id, foundIndex: idx, newData: u });

                        if (idx >= 0) {
                            next[idx] = u;
                        } else {
                            console.warn('[Grid Debug] Row not found for update:', id);
                        }
                    });
                }

                // Add
                if (updates.add) {
                    next = [...next, ...updates.add];
                }

                return next;
            });
        },

        getRowNode: (id) => rows.rowsRef.current.find((r) => r.id === id) || null,
        forEachNode: (callback) => rows.rowsRef.current.forEach(callback),

        getDisplayedRowCount: () => rows.displayedRowsRef.current.length,
        getDisplayedRowAtIndex: (index) => rows.displayedRowsRef.current[index] || null,
        getDisplayedRows: () => rows.displayedRowsRef.current,

        getSelectedRows: () => {
            // Use sortedRows to include all pages (Client-Side) but respecting filters.
            // For Server-Side, sortedRows is only current page anyway.
            const source = rows.sortedRows;
            return source.filter((r) => selection.selection.selectedRows.has(r.id));
        },
        getSelectedNodes: () => rows.sortedRows.filter((r) => selection.selection.selectedRows.has(r.id)),

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
            // Optimization: check if all satisfy condition
            const allSatisfy = rowIds.every(id => selection.selection.selectedRows.has(id) === selected);
            if (allSatisfy) return;
            selection.selectRows(rowIds, selected);
        },

        getColumnDefs: () => columns.columns,
        setColumnVisible: (field, visible) => {
            columns.setHiddenColumns((prev) => {
                const isHidden = prev.has(field);
                if ((visible && !isHidden) || (!visible && isHidden)) return prev; // No change

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
            // We can check current width but width mapping is in state. 
            // Assume setColumnWidths handles basic identity check if we use updater correctly.
            columns.setColumnWidths((prev) => {
                if (prev[field] === width) return prev;
                return { ...prev, [field]: width };
            });
        },
        autoSizeColumn: () => { },
        autoSizeAllColumns: () => { },

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

        ensureRowVisible: (_id) => { },
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

        refreshCells: () => { },
        redrawRows: () => { },
        refresh: () => {
            if (paginationMode === 'server') {
                rows.serverSideState.refresh();
            } else {
                // Determine if refresh should clear filters/sort? 
                // Currently it acts as a 'Reset View'.
                // User requested selection preservation.
                sortFilter.setFilterModel([]);
                sortFilter.setSortModel([]);
                sortFilter.setQuickFilter('');
                pagination.setPaginationState(prev => ({ ...prev, currentPage: 0 }));
                // selection.setSelection - Preserved
            }
        },
        refreshSelection: () => {
            const currentSelected = Array.from(selection.selection.selectedRows);
            if (currentSelected.length === 0) return;

            selection.deselectAll();
            // Immediate re-selection to trigger updates
            // We use selectRows which normally merges, but since we cleared, it just sets them.
            selection.selectRows(currentSelected, true);
        },

        undo: () => {
            rows.setInternalRowData((current) => {
                if (rows.historyRef.current.length === 0) return current;
                const previous = rows.historyRef.current.pop();
                return previous || current;
            });
        },

        pasteFromClipboard: async () => {
            if (navigator.clipboard && navigator.clipboard.readText) {
                try {
                    const text = await navigator.clipboard.readText();
                    if (!text) return;

                    const separator = text.includes('\t') ? '\t' : ',';
                    const pastedRows = text.split('\n').filter(r => r.trim() !== '');
                    const newRows: T[] = [];

                    const visibleCols = columns.columns.filter(c => !c.hide).map(c => c.field);

                    pastedRows.forEach(rowStr => {
                        const values = rowStr.split(separator);
                        const newRow: any = {};
                        visibleCols.forEach((colField, i) => {
                            if (i < values.length) {
                                setValueAtPath(newRow, colField, values[i]);
                            }
                        });
                        if (!newRow.id) newRow.id = `pasted-${Date.now()}-${Math.random()}`;
                        newRows.push(newRow as T);
                    });

                    if (newRows.length > 0) {
                        rows.setInternalRowData(prev => {
                            rows.historyRef.current.push([...prev]);
                            return [...prev, ...newRows];
                        });
                    }
                } catch (err) {
                    console.warn('Failed to read from clipboard. Context might be insecure.', err);
                }
            } else {
                console.warn('Clipboard API not available (readText).');
            }
        },
        addChildToRow: grouping.addChildToRow,
    };
};
