import { GridApi, RowNode } from "../../../../../../types";
export const splitManager = <T>(
    api: GridApi<T>,
    rowId: string,
    currentRows: RowNode<T>[],
    options?: { asChild?: boolean }
) => {
    const rows = [...currentRows];
    const index = rows.findIndex((r) => r.id === rowId);
    if (index === -1) {
        console.warn(`Row with ID ${rowId} not found for splitting.`);
        return;
    }
    const originalRowNode = rows[index];
    const originalData = originalRowNode.data;
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `${rowId}-split-${timestamp}-${random}`;
    const originalItem = originalRowNode.data;
    const newItem = { ...originalItem };
    if (typeof newItem === 'object' && newItem !== null) {
        if ('id' in newItem) (newItem as any).id = newId;
        if ('ID' in newItem) (newItem as any).ID = newId;
    }
    if (options?.asChild && api.addChildToRow) {
        console.log('[SplitManager] Adding as child', rowId, newItem);
        api.addChildToRow(rowId, [newItem]);
        return;
    } else {
        console.log('[SplitManager] Standard split', options, api.addChildToRow ? 'Has api method' : 'No api method');
    }
    const currentData = rows.map(r => r.data);
    currentData.splice(index + 1, 0, newItem);
    api.setRowData(currentData);
};
