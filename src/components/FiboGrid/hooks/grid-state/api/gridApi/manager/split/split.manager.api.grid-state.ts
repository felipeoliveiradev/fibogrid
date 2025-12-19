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

    // Generate a unique ID for the new row
    // Using a timestamp and random suffix to ensure uniqueness
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `${rowId}-split-${timestamp}-${random}`;

    // Clone the data
    const originalItem = originalRowNode.data;

    // Deep clone might be safer, but shallow spread is standard for React updates
    const newItem = { ...originalItem };

    // Helper to try and set ID if it exists in the data as 'id' or 'ID'
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

    // Insert after the original (Flat Mode)
    const currentData = rows.map(r => r.data);
    currentData.splice(index + 1, 0, newItem);

    // Update the grid
    api.setRowData(currentData);
};
