import { useState, useMemo, useRef, useEffect, useDeferredValue, Dispatch, SetStateAction, MutableRefObject } from 'react';
import {
    FiboGridProps,
    RowNode,
    ServerSideDataSourceRequest,
    ProcessedColumn,
    SortModel,
    FilterModel,
    PaginationState,
    SelectionState
} from '../../types';
import { useServerSideData, ServerSideDataState } from '../useServerSideData';
import { serverQueryIdentity } from '../../utils/infiniteScroll';
import {
    sortRows,
    filterRows,
    setValueAtPath,
    getValueFromPath,
    isEqual,
} from '../../utils/helpers';
interface UseGridRowsProps<T> {
    props: FiboGridProps<T>;
    columns: ProcessedColumn<T>[];
    sortModel: SortModel[];
    filterModel: FilterModel[];
    quickFilter: string;
    paginationState: PaginationState;
    selection: SelectionState;
    rowsRef: MutableRefObject<RowNode<T>[]>;
    displayedRowsRef: MutableRefObject<RowNode<T>[]>;
}
export type GridHistoryEntry<T> =
    | { kind: 'snapshot'; rows: T[]; overrides: Record<string, Record<string, any>> }
    | { kind: 'cell'; rowId: string; field: string; previous: unknown; hadField: boolean };
export interface UseGridRowsResult<T> {
    rows: RowNode<T>[];
    rowsRef: MutableRefObject<RowNode<T>[]>;
    filteredRows: RowNode<T>[];
    sortedRows: RowNode<T>[];
    displayedRows: RowNode<T>[];
    displayedRowsRef: MutableRefObject<RowNode<T>[]>;
    internalRowData: T[];
    setInternalRowData: Dispatch<SetStateAction<T[]>>;
    overrides: Record<string, Record<string, any>>;
    setOverrides: Dispatch<SetStateAction<Record<string, Record<string, any>>>>;
    historyRef: MutableRefObject<GridHistoryEntry<T>[]>;
    redoHistoryRef: MutableRefObject<GridHistoryEntry<T>[]>;
    sortedRowsRef: MutableRefObject<RowNode<T>[]>;
    overridesRef: MutableRefObject<Record<string, Record<string, any>>>;
    internalRowDataRef: MutableRefObject<T[]>;
    serverSideState: ServerSideDataState<T>;
    totalRows: number;
}
const EMPTY_ROW_DATA: readonly any[] = [];
function withDisplayedSelection<T>(page: RowNode<T>[], selectedIds: Set<string>): RowNode<T>[] {
    const len = page.length;
    let next: RowNode<T>[] | null = null;
    for (let i = 0; i < len; i++) {
        const row = page[i];
        const selected = selectedIds.has(row.id);
        if (row.selected === selected) continue;
        if (next === null) next = page.slice();
        next[i] = { ...row, selected };
    }
    return next ?? page;
}
export function useGridRows<T>({
    props,
    columns,
    sortModel,
    filterModel,
    quickFilter,
    paginationState,
    selection,
    rowsRef,
    displayedRowsRef
}: UseGridRowsProps<T>): UseGridRowsResult<T> {
    const {
        rowData,
        getRowId,
        pagination = false,
        paginationMode = 'client',
        serverSideDataSource,
        infiniteScroll = false,
        columnDefs,
    } = props;
    const isServerData = paginationMode === 'server' || infiniteScroll;
    const [internalRowData, setInternalRowData] = useState<T[]>(() => rowData ?? []);
    const [overrides, setOverrides] = useState<Record<string, Record<string, any>>>({});
    const historyRef = useRef<GridHistoryEntry<T>[]>([]);
    const redoHistoryRef = useRef<GridHistoryEntry<T>[]>([]);
    const sortedRowsRef = useRef<RowNode<T>[]>([]);
    const overridesRef = useRef<Record<string, Record<string, any>>>({});
    const internalRowDataRef = useRef<T[]>([]);
    const { clientFilterModel, serverFilterModel } = useMemo(() => {
        const client: FilterModel[] = [];
        const server: FilterModel[] = [];
        filterModel.forEach((filter) => {
            const col = columnDefs.find((c) => c.field === filter.field);
            if (col?.useInternalFilter) {
                client.push(filter);
            } else {
                server.push(filter);
            }
        });
        return { clientFilterModel: client, serverFilterModel: server };
    }, [filterModel, columnDefs]);
    const queryIdentity = useMemo(
        () =>
            serverQueryIdentity({
                pageSize: paginationState.pageSize,
                sortModel,
                filterModel: serverFilterModel,
                quickFilterText: quickFilter,
            }),
        [paginationState.pageSize, sortModel, serverFilterModel, quickFilter],
    );
    const queryIdentityRef = useRef(queryIdentity);
    const requestPage =
        infiniteScroll && queryIdentityRef.current !== queryIdentity
            ? 0
            : paginationState.currentPage;
    queryIdentityRef.current = queryIdentity;
    const serverSideRequest: ServerSideDataSourceRequest = useMemo(() => ({
        page: requestPage,
        pageSize: paginationState.pageSize,
        sortModel,
        filterModel: serverFilterModel,
        quickFilterText: quickFilter,
    }), [requestPage, paginationState.pageSize, sortModel, serverFilterModel, quickFilter]);
    const serverSideOptions = useMemo(
        () => ({ append: infiniteScroll, getRowId }),
        [infiniteScroll, getRowId],
    );
    const serverSideState = useServerSideData(
        isServerData,
        serverSideDataSource,
        serverSideRequest,
        serverSideOptions,
    );
    const controlledRows = (isServerData
        ? serverSideState.data
        : (rowData ?? (EMPTY_ROW_DATA as readonly T[]))) as readonly T[];
    const getRowIdRef = useRef(getRowId);
    getRowIdRef.current = getRowId;
    const prevSourceRef = useRef<readonly T[] | null>(null);
    useEffect(() => {
        if (prevSourceRef.current === controlledRows) return;
        const previousSource = prevSourceRef.current;
        prevSourceRef.current = controlledRows;
        if (previousSource === null) return;
        if (!isServerData) {
            setInternalRowData(controlledRows as T[]);
        }
        const resolveId = getRowIdRef.current;
        setOverrides((current) => dropStaleCellOverrides(
            current,
            previousSource,
            controlledRows,
            resolveId,
        ));
    }, [controlledRows, isServerData]);
    const baseRows = useMemo(() => {
        const sourceData = isServerData ? serverSideState.data : internalRowData;
        const len = sourceData.length;
        const result: RowNode<T>[] = new Array(len);
        for (let i = 0; i < len; i++) {
            const raw = sourceData[i];
            const rowId = getRowId ? getRowId(raw) : `row-${i}`;
            result[i] = {
                id: rowId,
                data: raw,
                rowIndex: i,
                selected: false,
                expanded: false,
                level: 0,
            };
        }
        return result;
    }, [internalRowData, serverSideState.data, isServerData, getRowId]);
    const rowIndexById = useMemo(() => {
        const map = new Map<string, number>();
        for (let i = 0; i < baseRows.length; i++) {
            map.set(baseRows[i].id, i);
        }
        return map;
    }, [baseRows]);
    const rows = useMemo(() => {
        const ids = Object.keys(overrides);
        if (ids.length === 0) return baseRows;
        const next = baseRows.slice();
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i]!;
            const index = rowIndexById.get(id);
            const fields = overrides[id];
            if (index == null || !fields) continue;
            let data = baseRows[index].data;
            const fieldNames = Object.keys(fields);
            for (let f = 0; f < fieldNames.length; f++) {
                const field = fieldNames[f]!;
                data = setValueAtPath(data, field, fields[field]);
            }
            next[index] = { ...baseRows[index], data };
        }
        return next;
    }, [baseRows, overrides, rowIndexById]);
    rowsRef.current = rows;
    internalRowDataRef.current = internalRowData;
    overridesRef.current = overrides;
    const deferredQuickFilter = useDeferredValue(quickFilter);
    const editedFields = useMemo(() => collectEditedFields(overrides), [overrides]);
    const layoutRef = useRef<{
        base: RowNode<T>[];
        filtered: RowNode<T>[];
        sorted: RowNode<T>[];
        sortedReady: boolean;
    } | null>(null);
    const filteredRows = useMemo(() => {
        const filterTouchesEdit = filterModel.some((filter) => editedFields.has(filter.field));
        const layout = layoutRef.current;
        if (
            !isServerData
            && !filterTouchesEdit
            && !deferredQuickFilter
            && layout?.base === baseRows
        ) {
            const patched = patchRowNodes(layout.filtered, rows, rowIndexById);
            if (patched) {
                layoutRef.current = { ...layout, filtered: patched };
                return patched;
            }
            return layout.filtered;
        }
        let next: RowNode<T>[];
        if (isServerData) {
            next = clientFilterModel.length > 0
                ? filterRows(rows, clientFilterModel, columns, '')
                : rows;
        } else if (filterModel.length === 0 && !deferredQuickFilter) {
            next = rows;
        } else {
            next = filterRows(rows, filterModel, columns, deferredQuickFilter);
        }
        layoutRef.current = {
            base: baseRows,
            filtered: next,
            sorted: next,
            sortedReady: false,
        };
        return next;
    }, [rows, baseRows, rowIndexById, filterModel, columns, deferredQuickFilter, isServerData, clientFilterModel, editedFields]);
    const sortedRows = useMemo(() => {
        if (isServerData) {
            return filteredRows;
        }
        const sortTouchesEdit = sortModel.some((sort) => editedFields.has(sort.field));
        const layout = layoutRef.current;
        if (
            sortModel.length > 0
            && !sortTouchesEdit
            && layout?.sortedReady
            && layout.base === baseRows
        ) {
            const patched = patchRowNodes(layout.sorted, rows, rowIndexById);
            if (patched) {
                layoutRef.current = { ...layout, sorted: patched };
                return patched;
            }
            return layout.sorted;
        }
        if (sortModel.length === 0) {
            let needsUpdate = false;
            for (let i = 0; i < filteredRows.length; i++) {
                if (filteredRows[i].rowIndex !== i) {
                    needsUpdate = true;
                    break;
                }
            }
            const next = needsUpdate
                ? filteredRows.map((row, index) => (row.rowIndex === index ? row : { ...row, rowIndex: index }))
                : filteredRows;
            if (layoutRef.current) {
                layoutRef.current = { ...layoutRef.current, sorted: next, sortedReady: false };
            }
            return next;
        }
        const sorted = sortRows(filteredRows, sortModel, columns);
        const len = sorted.length;
        const result: RowNode<T>[] = new Array(len);
        for (let i = 0; i < len; i++) {
            const row = sorted[i];
            result[i] = row.rowIndex === i ? row : { ...row, rowIndex: i };
        }
        if (layoutRef.current) {
            layoutRef.current = { ...layoutRef.current, sorted: result, sortedReady: true };
        }
        return result;
    }, [filteredRows, rows, baseRows, rowIndexById, sortModel, columns, isServerData, editedFields]);
    sortedRowsRef.current = sortedRows;
    const displayedRows = useMemo(() => {
        let page = sortedRows;
        if (pagination && !isServerData) {
            const pageSize = paginationState.pageSize;
            const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
            const currentPage = Math.min(paginationState.currentPage, totalPages - 1);
            const start = currentPage * pageSize;
            page = sortedRows.slice(start, start + pageSize);
        }
        return withDisplayedSelection(page, selection.selectedRows);
    }, [sortedRows, pagination, paginationMode, isServerData, paginationState.currentPage, paginationState.pageSize, selection.selectedRows]);
    displayedRowsRef.current = displayedRows;
    const totalRows = isServerData ? serverSideState.totalRows : sortedRows.length;
    return useMemo(() => ({
        rows,
        rowsRef,
        filteredRows,
        sortedRows,
        displayedRows,
        displayedRowsRef,
        internalRowData,
        setInternalRowData,
        overrides,
        setOverrides,
        historyRef,
        redoHistoryRef,
        sortedRowsRef,
        overridesRef,
        internalRowDataRef,
        serverSideState,
        totalRows
    }), [
        rows,
        rowsRef,
        filteredRows,
        sortedRows,
        displayedRows,
        displayedRowsRef,
        internalRowData,
        setInternalRowData,
        overrides,
        setOverrides,
        historyRef,
        redoHistoryRef,
        sortedRowsRef,
        overridesRef,
        internalRowDataRef,
        serverSideState,
        totalRows,
    ]);
}
function rowIdOf<T>(row: T, index: number, getRowId?: (row: T) => string): string {
    return getRowId ? getRowId(row) : `row-${index}`;
}
function collectEditedFields(overrides: Record<string, Record<string, any>>): Set<string> {
    const fields = new Set<string>();
    const ids = Object.keys(overrides);
    for (let i = 0; i < ids.length; i++) {
        const rowFields = overrides[ids[i]!];
        if (!rowFields) continue;
        const names = Object.keys(rowFields);
        for (let f = 0; f < names.length; f++) {
            fields.add(names[f]!);
        }
    }
    return fields;
}
function patchRowNodes<T>(
    previous: RowNode<T>[],
    current: RowNode<T>[],
    indexById: Map<string, number>,
): RowNode<T>[] | null {
    let changed = false;
    const next = previous.slice();
    for (let i = 0; i < next.length; i++) {
        const index = indexById.get(next[i].id);
        if (index == null) continue;
        const replacement = current[index];
        if (!replacement || replacement === next[i]) continue;
        next[i] = replacement.rowIndex === next[i].rowIndex
            ? replacement
            : { ...replacement, rowIndex: next[i].rowIndex };
        changed = true;
    }
    return changed ? next : null;
}
function indexRowsById<T>(rows: readonly T[], getRowId?: (row: T) => string): Map<string, T> {
    const map = new Map<string, T>();
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as T;
        map.set(rowIdOf(row, i, getRowId), row);
    }
    return map;
}
function dropStaleCellOverrides<T>(
    overrides: Record<string, Record<string, any>>,
    previousRows: readonly T[],
    nextRows: readonly T[],
    getRowId?: (row: T) => string,
): Record<string, Record<string, any>> {
    const ids = Object.keys(overrides);
    if (ids.length === 0) return overrides;
    const previousById = indexRowsById(previousRows, getRowId);
    const nextById = indexRowsById(nextRows, getRowId);
    let changed = false;
    const next: Record<string, Record<string, any>> = {};
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]!;
        const fields = overrides[id];
        const previousRow = previousById.get(id);
        const nextRow = nextById.get(id);
        if (!fields || !previousRow || !nextRow) {
            changed = true;
            continue;
        }
        const fieldNames = Object.keys(fields);
        const kept: Record<string, any> = {};
        let keptCount = 0;
        for (let f = 0; f < fieldNames.length; f++) {
            const field = fieldNames[f]!;
            if (isEqual(getValueFromPath(previousRow, field), getValueFromPath(nextRow, field))) {
                kept[field] = fields[field];
                keptCount++;
            } else {
                changed = true;
            }
        }
        if (keptCount > 0) {
            next[id] = keptCount === fieldNames.length ? fields : kept;
        }
    }
    return changed ? next : overrides;
}
