import { useState, useMemo, useRef, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react';
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
import {
    sortRows,
    filterRows,
    setValueAtPath,
} from '../../utils/helpers';
import { useGridEventSystem } from './useGridEventSystem'; // Assuming not needed directly but good for consistency

// Need types for inputs from other hooks
interface UseGridRowsProps<T> {
    props: FiboGridProps<T>;
    columns: ProcessedColumn<T>[];
    sortModel: SortModel[];
    filterModel: FilterModel[];
    quickFilter: string;
    paginationState: PaginationState;
    selection: SelectionState; // rows dependency on selection for `selected` prop
    rowsRef: MutableRefObject<RowNode<T>[]>;
    displayedRowsRef: MutableRefObject<RowNode<T>[]>;
}

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
    historyRef: MutableRefObject<T[][]>;
    serverSideState: ServerSideDataState<T>;
    totalRows: number;
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
        columnDefs, // needed for serverFilterModel calculation
    } = props;

    const [internalRowData, setInternalRowData] = useState<T[]>(rowData || []);
    const [overrides, setOverrides] = useState<Record<string, Record<string, any>>>({});

    const prevRowDataRef = useRef(rowData);
    if (rowData !== prevRowDataRef.current) {
        prevRowDataRef.current = rowData;
        setInternalRowData(rowData || []);
    }

    // History for undo
    const historyRef = useRef<T[][]>([]);



    // Server Side filtering split
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

    const serverSideRequest: ServerSideDataSourceRequest = useMemo(() => ({
        page: paginationState.currentPage,
        pageSize: paginationState.pageSize,
        sortModel,
        filterModel: serverFilterModel,
        quickFilterText: quickFilter,
    }), [paginationState.currentPage, paginationState.pageSize, sortModel, serverFilterModel, quickFilter]);

    const serverSideState = useServerSideData(
        paginationMode === 'server',
        serverSideDataSource,
        serverSideRequest
    );



    // Derived State Reset Pattern: Atomic clear of overrides when server data changes
    const [prevServerData, setPrevServerData] = useState(serverSideState.data);
    if (serverSideState.data !== prevServerData) {
        setPrevServerData(serverSideState.data);
        setOverrides({});
    }

    // Reset overrides when rowData changes (Prop change)
    useEffect(() => {
        setOverrides({});
    }, [rowData]);

    // 1. Process Raw Data into RowNodes
    const rows = useMemo(() => {
        const sourceData = paginationMode === 'server' ? serverSideState.data : internalRowData;
        const len = sourceData.length;
        const result: RowNode<T>[] = new Array(len);
        for (let i = 0; i < len; i++) {
            const raw = sourceData[i];
            const rowId = getRowId ? getRowId(raw) : `row-${i}`;

            let data = raw;
            if (overrides[rowId]) {
                Object.entries(overrides[rowId]).forEach(([field, value]) => {
                    data = setValueAtPath(data, field, value);
                });
            }

            result[i] = {
                id: rowId,
                data,
                rowIndex: i,
                selected: selection.selectedRows.has(rowId),
                expanded: false,
                level: 0,
            };
        }
        return result;
    }, [internalRowData, serverSideState.data, paginationMode, getRowId, overrides, selection.selectedRows]);

    rowsRef.current = rows;

    // 2. Filter Rows
    const filteredRows = useMemo(() => {
        if (paginationMode === 'server') {
            if (clientFilterModel.length > 0) {
                return filterRows(rows, clientFilterModel, columns, '');
            }
            return rows;
        }

        if (filterModel.length === 0 && !quickFilter) {
            return rows;
        }

        return filterRows(rows, filterModel, columns, quickFilter);
    }, [rows, filterModel, columns, quickFilter, paginationMode, clientFilterModel]); // Added clientFilterModel

    // 3. Sort Rows
    const sortedRows = useMemo(() => {
        if (paginationMode === 'server') {
            return filteredRows;
        }

        if (sortModel.length === 0) {
            let needsUpdate = false;
            for (let i = 0; i < filteredRows.length; i++) {
                if (filteredRows[i].rowIndex !== i) {
                    needsUpdate = true;
                    break;
                }
            }
            if (!needsUpdate) return filteredRows;

            const len = filteredRows.length;
            const result: RowNode<T>[] = new Array(len);
            for (let i = 0; i < len; i++) {
                const row = filteredRows[i];
                result[i] = { ...row, rowIndex: i };
            }
            return result;
        }

        const sorted = sortRows(filteredRows, sortModel, columns);
        const len = sorted.length;
        const result: RowNode<T>[] = new Array(len);
        for (let i = 0; i < len; i++) {
            const row = sorted[i];
            result[i] = row.rowIndex === i ? row : { ...row, rowIndex: i };
        }
        return result;
    }, [filteredRows, sortModel, columns, paginationMode]);

    // 4. Paginate / Display Rows
    const displayedRows = useMemo(() => {
        if (!pagination) {
            return sortedRows;
        }

        if (paginationMode === 'server') {
            return sortedRows;
        }

        const pageSize = paginationState.pageSize;
        const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
        const currentPage = Math.min(paginationState.currentPage, totalPages - 1);
        const start = currentPage * pageSize;
        return sortedRows.slice(start, start + pageSize);
    }, [sortedRows, pagination, paginationMode, paginationState.currentPage, paginationState.pageSize]);

    displayedRowsRef.current = displayedRows;

    // Total rows for pagination hook (derived)
    const totalRows = paginationMode === 'server' ? serverSideState.totalRows : sortedRows.length;

    return {
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
        serverSideState,
        totalRows
    };
}
