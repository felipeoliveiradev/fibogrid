import React from 'react';
import { CellRendererParams, HeaderRendererParams } from '../types';
import { Checkbox } from '@/components/ui/checkbox';
import { useGridContext } from '../context/GridContext';

function useAriaLabel(key: 'selectRow' | 'selectAllRows', fallback: string): string {
    const locale = useGridContext()?.locale;
    return locale?.aria[key] ?? fallback;
}

export const RowNumberRenderer = (params: CellRendererParams) => {
    return (
        <span className="text-muted-foreground text-xs font-mono w-full text-center block">
            {params.rowIndex + 1}
        </span>
    );
};

function SelectRowCheckbox({ params }: { params: CellRendererParams }) {
    const { rowNode, api } = params;
    const label = useAriaLabel('selectRow', 'Select row');
    const isSelected = rowNode.selected;
    const handleCheckedChange = (checked: boolean) => {
        api.selectRow(rowNode.id, checked);
    };
    return (
        <div className="flex items-center justify-center w-full h-full">
            <Checkbox
                checked={isSelected}
                onCheckedChange={handleCheckedChange}
                aria-label={label}
                className="translate-y-[2px]"
            />
        </div>
    );
}

export const CheckboxCellRenderer = (params: CellRendererParams) => {
    return <SelectRowCheckbox params={params} />;
};

function SelectAllCheckbox({ params }: { params: HeaderRendererParams }) {
    const { api } = params;
    const label = useAriaLabel('selectAllRows', 'Select all rows');
    const selectedCount = api.getSelectedRows().length;
    const totalCount = api.getDisplayedRows().length;
    const isAllSelected = totalCount > 0 && selectedCount === totalCount;
    const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;
    const handleCheckedChange = (checked: boolean) => {
        if (checked) {
            api.selectAll();
        } else {
            api.deselectAll();
        }
    };
    return (
        <div className="flex items-center justify-center w-full h-full">
            <Checkbox
                checked={isAllSelected || (isIndeterminate ? 'indeterminate' : false)}
                onCheckedChange={handleCheckedChange}
                aria-label={label}
                className="translate-y-[2px]"
            />
        </div>
    );
}

export const CheckboxHeaderRenderer = (params: HeaderRendererParams) => {
    return <SelectAllCheckbox params={params} />;
};
