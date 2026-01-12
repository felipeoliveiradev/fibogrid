import { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { FiboGridProps, ColumnDef, ProcessedColumn } from '../../types';
import { processColumns } from '../../utils/helpers';
import {
    RowNumberRenderer,
    CheckboxCellRenderer,
    CheckboxHeaderRenderer
} from '../../components/SpecialRenderers';
export interface UseGridColumnsResult<T> {
    columnOrder: string[];
    setColumnOrder: Dispatch<SetStateAction<string[]>>;
    columnWidths: Record<string, number>;
    setColumnWidths: Dispatch<SetStateAction<Record<string, number>>>;
    hiddenColumns: Set<string>;
    setHiddenColumns: Dispatch<SetStateAction<Set<string>>>;
    pinnedColumns: Record<string, 'left' | 'right' | null>;
    setPinnedColumns: Dispatch<SetStateAction<Record<string, 'left' | 'right' | null>>>;
    setColumnPinned: (field: string, pinned: 'left' | 'right' | null) => void;
    processedColumns: ProcessedColumn<T>[];
    hasCustomRowNumber: boolean;
    hasCustomCheckbox: boolean;
    columns: ProcessedColumn<T>[];
}
export function useGridColumns<T>(
    props: FiboGridProps<T>,
    containerWidth: number
): UseGridColumnsResult<T> {
    const {
        columnDefs,
        defaultColDef,
    } = props;
    const [columnOrder, setColumnOrder] = useState<string[]>(() =>
        (columnDefs || []).map((c) => c.field)
    );
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
    const [pinnedColumns, setPinnedColumns] = useState<Record<string, 'left' | 'right' | null>>({});
    const { processedColumns, hasCustomRowNumber, hasCustomCheckbox } = useMemo(() => {
        let hasRowNumber = false;
        let hasCheckbox = false;
        const orderedDefs = columnOrder
            .map((field) => columnDefs.find((c) => c.field === field))
            .filter(Boolean) as ColumnDef<T>[];
        columnDefs.forEach((col) => {
            if (!columnOrder.includes(col.field)) {
                orderedDefs.push(col);
            }
        });
        const processed = processColumns(
            orderedDefs.map((col) => {
                const pinnedState = pinnedColumns[col.field];
                const pinned = pinnedState !== undefined ? pinnedState : col.pinned;
                const isRowNumber = col.type === 'rowNumber' || col.field === 'number';
                const isCheckbox = col.type === 'checkbox' || col.field === 'checkbox';
                if (isRowNumber) hasRowNumber = true;
                if (isCheckbox) hasCheckbox = true;
                return {
                    ...col,
                    width: columnWidths[col.field] ?? col.width,
                    hide: hiddenColumns.has(col.field) || col.hide,
                    pinned: pinned || undefined,
                    cellRenderer: isRowNumber ? RowNumberRenderer : (isCheckbox ? CheckboxCellRenderer : col.cellRenderer),
                    headerRenderer: isCheckbox ? CheckboxHeaderRenderer : col.headerRenderer,
                    suppressMenu: isRowNumber || isCheckbox ? true : col.suppressMenu,
                    sortable: isRowNumber || isCheckbox ? false : col.sortable,
                    filterType: isRowNumber || isCheckbox ? undefined : col.filterType,
                    resizable: isRowNumber || isCheckbox ? false : col.resizable,
                };
            }),
            containerWidth,
            defaultColDef
        );
        return { processedColumns: processed, hasCustomRowNumber: hasRowNumber, hasCustomCheckbox: hasCheckbox };
    }, [columnDefs, columnOrder, columnWidths, hiddenColumns, pinnedColumns, containerWidth, defaultColDef]);
    const columns = useMemo(() => {
        const sortByPriority = (a: ProcessedColumn<T>, b: ProcessedColumn<T>) => {
            const pA = a.pinnedPriority ?? Number.MAX_SAFE_INTEGER;
            const pB = b.pinnedPriority ?? Number.MAX_SAFE_INTEGER;
            if (pA === pB) return 0;
            return pA - pB;
        };
        const leftPinned = processedColumns.filter((c) => c.pinned === 'left').sort(sortByPriority);
        const center = processedColumns.filter((c) => !c.pinned);
        const rightPinned = processedColumns.filter((c) => c.pinned === 'right').sort(sortByPriority);
        return [...leftPinned, ...center, ...rightPinned];
    }, [processedColumns]);
    const setColumnPinned = (field: string, pinned: 'left' | 'right' | null) => {
        setPinnedColumns((prev) => ({ ...prev, [field]: pinned }));
    };
    return {
        columnOrder,
        setColumnOrder,
        columnWidths,
        setColumnWidths,
        hiddenColumns,
        setHiddenColumns,
        pinnedColumns,
        setPinnedColumns,
        processedColumns,
        hasCustomRowNumber,
        hasCustomCheckbox,
        columns,
        setColumnPinned
    };
}
