import { FiboGrid, useGridRegistry } from 'fibogrid';
import { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const CATEGORIES = [
    { id: 'cat-1', name: 'Electronics', description: 'Gadgets and devices' },
    { id: 'cat-2', name: 'Furniture', description: 'Home and office furniture' },
    { id: 'cat-3', name: 'Clothing', description: 'Apparel and accessories' },
];

const ITEMS = [
    { id: 'item-1', name: 'Smartphone', categoryId: 'cat-1', price: 999, stock: 50 },
    { id: 'item-2', name: 'Laptop', categoryId: 'cat-1', price: 1499, stock: 20 },
    { id: 'item-3', name: 'Headphones', categoryId: 'cat-1', price: 199, stock: 100 },
    { id: 'item-4', name: 'Office Chair', categoryId: 'cat-2', price: 299, stock: 15 },
    { id: 'item-5', name: 'Desk', categoryId: 'cat-2', price: 499, stock: 10 },
    { id: 'item-6', name: 'T-Shirt', categoryId: 'cat-3', price: 29, stock: 200 },
    { id: 'item-7', name: 'Jeans', categoryId: 'cat-3', price: 59, stock: 150 },
];

const CATEGORY_COL_DEFS: any[] = [
    { field: 'name', headerName: 'Category', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 }
];

const ITEM_COL_DEFS: any[] = [
    { field: 'name', headerName: 'Item', flex: 1 },
    { field: 'price', headerName: 'Price', width: 100, valueFormatter: (p: number) => `$${p}` },
    { field: 'categoryId', headerName: 'Cat ID', hide: true }
];

export function LinkedGrids() {
    const { getGridApi } = useGridRegistry();

    const handleReset = useCallback(() => {
        const catApi = getGridApi('grid-categories');
        const itemApi = getGridApi('grid-items');

        catApi?.deselectAll();
        itemApi?.deselectAll();

        catApi?.setFilterModel([]);
        itemApi?.setFilterModel([]);
    }, [getGridApi]);

    const handleCategoryClick = useCallback((e: any) => {
        const catApi = getGridApi('grid-categories');
        const itemApi = getGridApi('grid-items');
        const categoryId = e.rowData.id;

        requestAnimationFrame(() => {
            const selectedRows = catApi?.getSelectedRows() || [];
            const isSelected = selectedRows.some((row: any) => row.data.id === categoryId);

            if (isSelected && itemApi) {
                itemApi.setFilterModel([
                    {
                        field: 'categoryId',
                        filterType: 'text',
                        operator: 'equals',
                        value: categoryId
                    }
                ]);
            } else if (itemApi) {
                itemApi.setFilterModel([]);
            }
        });
    }, [getGridApi]);

    const handleItemClick = useCallback((e: any) => {
        const catApi = getGridApi('grid-categories');
        const itemApi = getGridApi('grid-items');
        const categoryId = e.rowData.categoryId;

        requestAnimationFrame(() => {
            const selectedRows = itemApi?.getSelectedRows() || [];
            const isSelected = selectedRows.some((row: any) => row.data.id === e.rowData.id);

            if (isSelected) {
                if (catApi) {
                    catApi.setFilterModel([
                        {
                            field: 'id',
                            filterType: 'text',
                            operator: 'equals',
                            value: categoryId
                        }
                    ]);
                }

                if (itemApi) {
                    itemApi.setFilterModel([
                        {
                            field: 'categoryId',
                            filterType: 'text',
                            operator: 'equals',
                            value: categoryId
                        }
                    ]);
                }
            } else {
                catApi?.setFilterModel([]);
                itemApi?.setFilterModel([]);
            }
        });
    }, [getGridApi]);

    return (
        <Card className="mt-8 border-primary/20 shadow-parchment">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-display text-gradient-gold">Linked Grids Registry Demo</CardTitle>
                <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Reset Interaction
                </Button>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="font-semibold text-muted-foreground">Categories (Master)</h3>
                    <div className="h-[300px] border rounded-md overflow-hidden">
                        <FiboGrid
                            gridId="grid-categories"
                            rowData={CATEGORIES}
                            columnDefs={CATEGORY_COL_DEFS}
                            rowSelection="single"
                            onRowClickFallback={handleCategoryClick}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-muted-foreground">Items (Detail)</h3>
                    <div className="h-[300px] border rounded-md overflow-hidden">
                        <FiboGrid
                            gridId="grid-items"
                            rowData={ITEMS}
                            columnDefs={ITEM_COL_DEFS}
                            rowSelection="single"
                            onRowClickFallback={handleItemClick}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
