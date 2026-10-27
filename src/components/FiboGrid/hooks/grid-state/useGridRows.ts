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
import { repositionRows } from '../../utils/sortedIndex';
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
    rowIndexByIdRef: MutableRefObject<Map<string, number>>;
    serverSideState: ServerSideDataState<T>;
    totalRows: number;
}
const EMPTY_ROW_DATA: readonly any[] = [];
const EMPTY_CHANGED_FIELDS = new Set<string>();
const EMPTY_CHANGED_IDS: readonly string[] = [];
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
    const prevBaseRowsRef = useRef<RowNode<T>[]>([]);
    const prevRowIndexMapRef = useRef<Map<string, number>>(new Map());
    const rowIndexByIdRef = useRef<Map<string, number>>(new Map());
    const { baseRows, rowIndexById, changedBaseFields, changedRowIds } = useMemo(() => {
        const sourceData = isServerData ? serverSideState.data : internalRowData;
        const len = sourceData.length;
        const prevBase = prevBaseRowsRef.current;
        const result: RowNode<T>[] = new Array(len);
        const canReuseMap = prevBase.length === len && prevRowIndexMapRef.current.size === len;
        let idsUnchanged = canReuseMap;
        const diffFields = new Set<string>();
        const changedIds: string[] = [];
        for (let i = 0; i < len; i++) {
            const raw = sourceData[i];
            const prevNode = prevBase[i];
            if (prevNode && prevNode.data === raw && prevNode.rowIndex === i) {
                result[i] = prevNode;
                continue;
            }
            const rowId = getRowId ? getRowId(raw) : `row-${i}`;
            if (!prevNode || prevNode.id !== rowId) {
                idsUnchanged = false;
            } else if (idsUnchanged) {
                changedIds.push(rowId);
                if (prevNode.data && raw && typeof prevNode.data === 'object' && typeof raw === 'object') {
                const prevRec = prevNode.data as Record<string, unknown>;
                const nextRec = raw as Record<string, unknown>;
                const keys = Object.keys(nextRec);
                for (let k = 0; k < keys.length; k++) {
                    const key = keys[k]!;
                    if (prevRec[key] !== nextRec[key]) {
                        diffFields.add(key);
                    }
                }
                }
            }
            result[i] = {
                id: rowId,
                data: raw,
                rowIndex: i,
                selected: false,
                expanded: false,
                level: 0,
            };
        }
        prevBaseRowsRef.current = result;
        const changedBaseFields = diffFields.size === 0 ? EMPTY_CHANGED_FIELDS : diffFields;
        if (idsUnchanged) {
            return {
                baseRows: result,
                rowIndexById: prevRowIndexMapRef.current,
                changedBaseFields,
                changedRowIds: changedIds.length === 0 ? EMPTY_CHANGED_IDS : changedIds,
            };
        }
        const map = new Map<string, number>();
        for (let i = 0; i < len; i++) {
            map.set(result[i].id, i);
        }
        prevRowIndexMapRef.current = map;
        // Topology changed (ids added/removed/reordered): no incremental ids.
        return { baseRows: result, rowIndexById: map, changedBaseFields, changedRowIds: EMPTY_CHANGED_IDS };
    }, [internalRowData, serverSideState.data, isServerData, getRowId]);
    rowIndexByIdRef.current = rowIndexById;
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
    const overrideFields = useMemo(() => collectEditedFields(overrides), [overrides]);
    const editedFields = useMemo(() => {
        const set = new Set<string>(overrideFields);
        changedBaseFields.forEach((f) => set.add(f));
        return set;
    }, [overrideFields, changedBaseFields]);
    const layoutRef = useRef<{
        base: RowNode<T>[];
        rowIndexById: Map<string, number>;
        filtered: RowNode<T>[];
        sorted: RowNode<T>[];
        sortedReady: boolean;
        filterModel: FilterModel[];
        quickFilter: string;
        sortModel: SortModel[];
        columns: ProcessedColumn<T>[];
    } | null>(null);
    const filteredRows = useMemo(() => {
        const filterTouchesEdit = filterModel.some((filter) => editedFields.has(filter.field));
        const layout = layoutRef.current;
        const sameTopology =
            layout != null
            && layout.rowIndexById === rowIndexById
            && layout.filterModel === filterModel
            && layout.quickFilter === deferredQuickFilter
            && layout.columns === columns;

        if (!isServerData && filterModel.length === 0 && !deferredQuickFilter) {
            // When preserving a sorted cache, keep the previous sortModel so
            // sortedRows sees a mismatch and re-sorts if sort changed.
            // Never write the new sortModel while sortedReady stays true.
            layoutRef.current = {
                base: baseRows,
                rowIndexById,
                filtered: rows,
                sorted: sameTopology ? layout.sorted : rows,
                sortedReady: sameTopology ? layout.sortedReady : false,
                filterModel,
                quickFilter: deferredQuickFilter,
                sortModel: sameTopology ? layout.sortModel : sortModel,
                columns,
            };
            return rows;
        }

        if (
            !isServerData
            && !filterTouchesEdit
            && !deferredQuickFilter
            && sameTopology
        ) {
            const patched = patchRowNodes(layout.filtered, rows, rowIndexById);
            const nextFiltered = patched ?? layout.filtered;
            layoutRef.current = {
                ...layout,
                base: baseRows,
                filtered: nextFiltered,
            };
            return nextFiltered;
        }
        let next: RowNode<T>[];
        if (isServerData) {
            next = clientFilterModel.length > 0
                ? filterRows(rows, clientFilterModel, columns, '')
                : rows;
        } else {
            next = filterRows(rows, filterModel, columns, deferredQuickFilter);
        }
        layoutRef.current = {
            base: baseRows,
            rowIndexById,
            filtered: next,
            sorted: next,
            sortedReady: false,
            filterModel,
            quickFilter: deferredQuickFilter,
            sortModel,
            columns,
        };
        return next;
        // sortModel intentionally omitted: filtering does not depend on it.
        // Writing a new sortModel into layoutRef while preserving sortedReady
        // would make sortedRows skip re-sort and show a stale order.
    }, [rows, baseRows, rowIndexById, filterModel, columns, deferredQuickFilter, isServerData, clientFilterModel, editedFields]);
    const sortedRows = useMemo(() => {
        if (isServerData) {
            return filteredRows;
        }
        const sortTouchesEdit = sortModel.some((sort) => editedFields.has(sort.field));
        const layout = layoutRef.current;

        // Live-stream path: single numeric sort column, only base data changed
        // (no cell overrides on that field), topology + sort cache intact.
        // Reposition just the changed rows via binary search: O(n + k log n)
        // instead of a full O(n log n) sortRows every tick.
        if (
            sortModel.length === 1
            && sortTouchesEdit
            && changedRowIds.length > 0
            && layout?.sortedReady
            && layout.rowIndexById === rowIndexById
            && layout.sortModel === sortModel
            && layout.columns === columns
            && layout.sorted.length > 0
        ) {
            const live = tryLiveReposition(
                layout.sorted,
                rows,
                rowIndexById,
                changedRowIds,
                sortModel[0]!,
                columns,
                overrideFields,
            );
            if (live) {
                layoutRef.current = { ...layout, sorted: live };
                return live;
            }
        }
        if (
            sortModel.length > 0
            && !sortTouchesEdit
            && layout?.sortedReady
            && layout.rowIndexById === rowIndexById
            && layout.sortModel === sortModel
            && layout.columns === columns
        ) {
            const patched = patchRowNodes(layout.sorted, rows, rowIndexById);
            if (patched) {
                layoutRef.current = { ...layout, sorted: patched };
                return patched;
            }
            return layout.sorted;
        }
        if (sortModel.length === 0) {
            if (filteredRows === rows) {
                if (layoutRef.current) {
                    layoutRef.current = { ...layoutRef.current, sorted: rows, sortedReady: false, sortModel, columns };
                }
                return rows;
            }
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
                layoutRef.current = { ...layoutRef.current, sorted: next, sortedReady: false, sortModel, columns };
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
            layoutRef.current = { ...layoutRef.current, sorted: result, sortedReady: true, sortModel, columns };
        }
        return result;
    }, [filteredRows, rows, rowIndexById, sortModel, columns, isServerData, editedFields, changedRowIds, overrideFields]);
    sortedRowsRef.current = sortedRows;
    const prevSelectedCountRef = useRef(0);
    const displayedRows = useMemo(() => {
        let page = sortedRows;
        if (pagination && !isServerData) {
            const pageSize = paginationState.pageSize;
            const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
            const currentPage = Math.min(paginationState.currentPage, totalPages - 1);
            const start = currentPage * pageSize;
            page = sortedRows.slice(start, start + pageSize);
        }
        const selectedCount = selection.selectedRows.size;
        // Stream hot path: with no selection and no prior selection, skip O(n) flag walk.
        // Fresh/patched nodes default to selected:false; only clear once after deselect-all.
        if (selectedCount === 0 && prevSelectedCountRef.current === 0) {
            return page;
        }
        prevSelectedCountRef.current = selectedCount;
        return withDisplayedSelection(page, selection.selectedRows);
    }, [sortedRows, pagination, isServerData, paginationState.currentPage, paginationState.pageSize, selection.selectedRows]);
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
        rowIndexByIdRef,
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
        rowIndexByIdRef,
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
    const len = previous.length;
    let next: RowNode<T>[] | null = null;
    for (let i = 0; i < len; i++) {
        const row = previous[i];
        const index = indexById.get(row.id);
        if (index == null) continue;
        const replacement = current[index];
        if (!replacement || replacement === row) continue;
        if (next === null) next = previous.slice();
        next[i] = replacement.rowIndex === row.rowIndex
            ? replacement
            : { ...replacement, rowIndex: row.rowIndex };
    }
    return next;
}
/**
 * Live-stream sort: reposition changed rows in the cached sorted array.
 * Returns null when the fast path does not apply (caller falls back to sortRows).
 */
function tryLiveReposition<T>(
    sorted: RowNode<T>[],
    rows: RowNode<T>[],
    rowIndexById: Map<string, number>,
    changedIds: readonly string[],
    sort: SortModel,
    columns: ProcessedColumn<T>[],
    overrideFields: Set<string>,
): RowNode<T>[] | null {
    const dir = sort.direction;
    if (dir !== 'asc' && dir !== 'desc') return null;
    const field = sort.field;
    // Overrides on the sort field and custom comparators change ordering semantics.
    if (overrideFields.has(field)) return null;
    const column = columns.find((c) => c.field === field);
    if (column?.comparator) return null;

    // Numeric gate: every changed value must be a real number (this subsumes
    // `filterType === 'number'` and the `typeof value === 'number'` check).
    const changedById = new Map<string, RowNode<T>>();
    for (let i = 0; i < changedIds.length; i++) {
        const id = changedIds[i]!;
        const index = rowIndexById.get(id);
        const node = index === undefined ? undefined : rows[index];
        if (!node) continue;
        const value = getValueFromPath(node.data, field);
        if (typeof value !== 'number' || Number.isNaN(value)) return null;
        changedById.set(id, node);
    }
    if (changedById.size === 0) return null;

    // O(1) guard: sortRows places null/undefined at one end; the binary search
    // treats them as +Infinity. If either end holds a non-number, bail out.
    const first = getValueFromPath(sorted[0]!.data, field);
    const last = getValueFromPath(sorted[sorted.length - 1]!.data, field);
    if (typeof first !== 'number' || typeof last !== 'number') return null;

    const repositioned = repositionRows(sorted, changedIds, changedById, field, dir);
    if (overrideFields.size === 0) return repositioned;
    // Other-field overrides may have produced fresh nodes for unchanged rows.
    return patchRowNodes(repositioned, rows, rowIndexById) ?? repositioned;
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
    let nextById: Map<string, T> | null = null;
    let changed = false;
    const next: Record<string, Record<string, any>> = {};
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]!;
        const fields = overrides[id];
        const previousRow = previousById.get(id);
        if (!fields || !previousRow) {
            changed = true;
            continue;
        }
        if (nextById === null) nextById = indexRowsById(nextRows, getRowId);
        const nextRow = nextById.get(id);
        if (!nextRow) {
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
