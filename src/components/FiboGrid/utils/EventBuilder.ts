import { GridApi, EventSubscription, DiffSubscription } from '../types';
import { useState, useEffect, useRef } from 'react';

export type EventHandler<T = any> = (data: T) => void;



export class EventBuilder<T = any> {
    private addEventListener: (eventType: string, listener: EventHandler) => void;
    private removeEventListener: (eventType: string, listener: EventHandler) => void;
    private fireEvent: (eventType: string, eventData: any) => void;
    private listeners: Map<string, Set<EventHandler>> = new Map();

    constructor(
        addEventListener: (eventType: string, listener: EventHandler) => void,
        removeEventListener: (eventType: string, listener: EventHandler) => void,
        fireEvent: (eventType: string, eventData: any) => void
    ) {
        this.addEventListener = addEventListener;
        this.removeEventListener = removeEventListener;
        this.fireEvent = fireEvent;
    }

    calls() {
        return {
            onSelectionChanged: (event: any) => this.fireEvent('selectionChanged', event),
            onSortChanged: (event: any) => this.fireEvent('sortChanged', event),
            onFilterChanged: (event: any) => this.fireEvent('filterChanged', event),
            onRowClicked: (event: any) => this.fireEvent('rowClicked', event),
            onCellValueChanged: (event: any) => this.fireEvent('cellValueChanged', event),
            onPaginationChanged: (event: any) => this.fireEvent('paginationChanged', event),
            onColumnResized: (event: any) => this.fireEvent('columnResized', event),
            onColumnMoved: (event: any) => this.fireEvent('columnMoved', event),
            onRowDataUpdated: (event: any) => this.fireEvent('rowDataUpdated', event),
            onCellEditingStarted: (event: any) => this.fireEvent('cellEditingStarted', event),
            onCellEditingStopped: (event: any) => this.fireEvent('cellEditingStopped', event),
            onQuickFilterChanged: (event: any) => this.fireEvent('quickFilterChanged', event),
            onFilterRemoved: (event: any) => this.fireEvent('filterRemoved', event),
        };
    }

    private createSubscription(eventName: string, transform?: (data: any) => any, filter?: (data: any) => boolean): EventSubscription {
        const self = this;

        const selfSubscription = {
            listen: (handler?: EventHandler): any => {
                if (handler) {
                    return createListen(handler);
                }
                return selfSubscription;
            },

            once: (handler?: EventHandler): any => {
                if (handler) {
                    const wrappedHandler = (data: any) => {
                        if (filter && !filter(data)) return;

                        self.removeEventListener(eventName, wrappedHandler);
                        self.listeners.get(eventName)?.delete(wrappedHandler);

                        const transformedData = transform ? transform(data) : data;
                        handler(transformedData);
                    };

                    self.addEventListener(eventName, wrappedHandler);

                    if (!self.listeners.has(eventName)) {
                        self.listeners.set(eventName, new Set());
                    }
                    self.listeners.get(eventName)!.add(wrappedHandler);

                    return () => {
                        self.removeEventListener(eventName, wrappedHandler);
                        self.listeners.get(eventName)?.delete(wrappedHandler);
                    };
                }
                return selfSubscription;
            },

            off: (handler?: EventHandler) => {
                if (handler) {
                    self.removeEventListener(eventName, handler);
                    self.listeners.get(eventName)?.delete(handler);
                } else {
                    const handlers = self.listeners.get(eventName);
                    if (handlers) {
                        handlers.forEach(h => self.removeEventListener(eventName, h));
                        handlers.clear();
                    }
                }
            },

            render: <R = any>(initialValue?: R): R => {
                const [value, setValue] = useState<R>(initialValue as R);
                // Use a ref to keep track of the setter, although useState setter is stable,
                // this pattern is consistent with stabilizing callbacks if we needed to.
                const setValueRef = useRef(setValue);
                setValueRef.current = setValue;

                useEffect(() => {
                    // Subscribe to the event
                    // When event fires, listen() calls handler with result.
                    // We pass setValue (via ref wrapper) as the handler.
                    const handler = (data: any) => {
                        setValueRef.current(data);
                    };

                    const unsub = createListen(handler);
                    return unsub;
                }, []); // Subscribe once on mount

                return value as R;
            }
        };
        return selfSubscription;

        function createListen(handler: EventHandler) {
            const wrappedHandler = (data: any) => {
                if (filter && !filter(data)) return;

                const result = transform ? transform(data) : data;
                handler(result);
            };

            self.addEventListener(eventName, wrappedHandler);

            if (!self.listeners.has(eventName)) {
                self.listeners.set(eventName, new Set());
            }
            self.listeners.get(eventName)!.add(wrappedHandler);

            return () => {
                self.removeEventListener(eventName, wrappedHandler);
                self.listeners.get(eventName)?.delete(wrappedHandler);
            };
        }
    }

    private createDiffSubscription<T>(
        eventName: string,
        transformActual: (data: any) => T,
        transformOld?: (data: any) => T,
        transformAll?: (data: any) => any
    ): any {
        const hasChanged = (data: any) => {
            if (!transformOld) return true;
            const curr = transformActual(data);
            const prev = transformOld(data);
            return curr !== prev;
        };

        const base = this.createSubscription(eventName, transformActual, hasChanged);

        const toVisual = (val: any) => {
            if (typeof val === 'number') return val + 1;
            return val;
        };

        const selfDiffSubscription = {
            ...base,
            listen: (handler?: EventHandler): any => {
                if (handler) {
                    return base.listen(handler);
                }
                return selfDiffSubscription;
            },
            once: (handler?: EventHandler): any => {
                if (handler) {
                    return base.once(handler);
                }
                return selfDiffSubscription;
            },
            old: () => this.createSubscription(eventName, transformOld || (() => undefined), hasChanged),
            actual: () => this.createSubscription(eventName, transformActual, hasChanged),
            all: () => this.createSubscription(eventName, transformAll || ((data) => data), hasChanged),
            visual: () => this.createDiffSubscription(
                eventName,
                (data) => toVisual(transformActual(data)),
                transformOld ? (data) => toVisual(transformOld(data)) : undefined,
                (data) => {
                    const allData = transformAll ? transformAll(data) : {};
                    return {
                        ...allData,
                        oldValue: toVisual(allData.oldValue),
                        newValue: toVisual(allData.newValue)
                    };
                }
            )
        };
        return selfDiffSubscription;
    }

    // Selection Changed Event
    onSelectionChanged() {
        return {
            ...this.createSubscription('selectionChanged'),
            // Get first selected row node
            getFirstRow: () => this.createSubscription('selectionChanged', (data) => data.selectedRows?.[0] || null),
            // Get first selected row data (just the data object)
            getRowData: () => this.createSubscription('selectionChanged', (data) => data.selectedRows?.[0]?.data || null),
            // Get all selected rows data (array of data objects)
            getAllData: () => this.createSubscription('selectionChanged', (data) => data.selectedRows?.map((row: any) => row.data) || []),
            // Get selected row IDs
            getIds: () => this.createSubscription('selectionChanged', (data) => data.selectedRows?.map((row: any) => row.id) || []),
            // Get count of selected rows
            getCount: () => this.createSubscription('selectionChanged', (data) => data.selectedRows?.length || 0),
        };
    }

    // Sort Changed Event
    onSortChanged() {
        return {
            ...this.createSubscription('sortChanged'),
            // Get current sort model
            getSortModel: () => this.createDiffSubscription(
                'sortChanged',
                (data) => data.sortModel || [],
                (data) => data.oldSortModel || [],
                (data) => ({ oldValue: data.oldSortModel, newValue: data.sortModel, api: data.api })
            ),
            // Get first sort column
            getFirstSort: () => this.createDiffSubscription(
                'sortChanged',
                (data) => data.sortModel?.[0] || null,
                (data) => data.oldSortModel?.[0] || null,
                (data) => ({ oldValue: data.oldSortModel?.[0], newValue: data.sortModel?.[0], api: data.api })
            ),
        };
    }

    // Filter Changed Event
    onFilterChanged() {
        return {
            ...this.createSubscription('filterChanged'),
            // Get current filter model
            getFilterModel: () => this.createDiffSubscription(
                'filterChanged',
                (data) => data.filterModel || [],
                (data) => data.oldFilterModel || [],
                (data) => ({ oldValue: data.oldFilterModel, newValue: data.filterModel, api: data.api })
            ),
            // Get active filter count
            getFilterCount: () => this.createDiffSubscription(
                'filterChanged',
                (data) => data.filterModel?.length || 0,
                (data) => data.oldFilterModel?.length || 0,
                (data) => ({ oldValue: data.oldFilterModel?.length, newValue: data.filterModel?.length, api: data.api })
            ),
        };
    }

    // Row Clicked Event
    onRowClicked() {
        return {
            ...this.createSubscription('rowClicked'),
            // Get clicked row data
            getRowData: () => this.createSubscription('rowClicked', (data) => data.rowNode?.data || null),
            // Get clicked row ID
            getRowId: () => this.createSubscription('rowClicked', (data) => data.rowNode?.id || null),
        };
    }

    // Cell Value Changed Event
    onCellValueChanged() {
        return {
            ...this.createSubscription('cellValueChanged'),
            // Get new value
            getNewValue: () => this.createSubscription('cellValueChanged', (data) => data.newValue),
            // Get old value
            getOldValue: () => this.createSubscription('cellValueChanged', (data) => data.oldValue),
            // Get field name
            getField: () => this.createSubscription('cellValueChanged', (data) => data.field),
        };
    }

    // Pagination Changed Event
    onPaginationChanged() {
        return {
            ...this.createSubscription('paginationChanged'),
            // Get current page
            getCurrentPage: () => this.createDiffSubscription(
                'paginationChanged',
                (data) => data.currentPage,
                (data) => data.oldCurrentPage,
                (data) => ({ oldValue: data.oldCurrentPage, newValue: data.currentPage, api: data.api })
            ),
            // Get page size
            getPageSize: () => this.createDiffSubscription(
                'paginationChanged',
                (data) => data.pageSize,
                (data) => data.oldPageSize,
                (data) => ({ oldValue: data.oldPageSize, newValue: data.pageSize, api: data.api })
            ),
            getTotalPages: () => this.createDiffSubscription(
                'paginationChanged',
                (data) => data.totalPages,
                (data) => undefined, // Total pages might not need diff, or we didn't track old total pages explicitly in the event yet? We should check useGridState.
                (data) => ({ oldValue: undefined, newValue: data.totalPages, api: data.api })
            ),
            // Get is first page
            getIsFirstPage: () => this.createSubscription('paginationChanged', (data) => data.isFirstPage),
            // Get is last page
            getIsLastPage: () => this.createSubscription('paginationChanged', (data) => data.isLastPage),
            // Get next page
            getNextPage: () => this.createDiffSubscription(
                'paginationChanged',
                (data) => data.nextPage,
                (data) => data.oldNextPage,
                (data) => ({ oldValue: data.oldNextPage, newValue: data.nextPage, api: data.api })
            ),
            // Get prev page
            getPrevPage: () => this.createDiffSubscription(
                'paginationChanged',
                (data) => data.prevPage,
                (data) => data.oldPrevPage,
                (data) => ({ oldValue: data.oldPrevPage, newValue: data.prevPage, api: data.api })
            ),
        };
    }

    onColumnResized() {
        return this.createSubscription('columnResized');
    }

    onColumnMoved() {
        return this.createSubscription('columnMoved');
    }

    onRowDataUpdated() {
        return this.createSubscription('rowDataUpdated');
    }

    onCellEditingStarted() {
        return this.createSubscription('cellEditingStarted');
    }

    onCellEditingStopped() {
        return this.createSubscription('cellEditingStopped');
    }

    onQuickFilterChanged() {
        return this.createSubscription('quickFilterChanged');
    }

    onFilterRemoved() {
        return this.createSubscription('filterRemoved');
    }
}
