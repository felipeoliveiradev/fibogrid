import { ColumnDef } from 'fibogrid';
import { StockRow } from '../data/types';
import { useStockColumns } from '../columns/stockColumns';

interface UseDemoColumnsProps {
    expandedRows: Set<string>;
    toggleRowExpand: (rowId: string) => void;
    handleSplitRow: (rowId: string) => void;
    hasChildren: (rowId: string) => boolean;
}

export function useDemoColumns(props: UseDemoColumnsProps) {
    const columns: ColumnDef<StockRow>[] = useStockColumns({
        expandedRows: props.expandedRows,
        toggleRowExpand: props.toggleRowExpand,
        handleSplitRow: props.handleSplitRow,
        hasChildren: props.hasChildren,
    });
    return { columns };
}

