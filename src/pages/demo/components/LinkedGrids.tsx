import { FiboGrid, useGridRegistry } from 'fibogrid';
import { useCallback, useMemo, useState } from 'react';
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

export function LinkedGrids({ useServerSide = false }: { useServerSide?: boolean }) {
    const { getGridApi } = useGridRegistry();

    const categoryDataSource = useMemo(() => ({
        getRows: async (params: any) => {
            await new Promise(resolve => setTimeout(resolve, 500));

            const data = CATEGORIES.map(c => ({ ...c, name: `${c.name} (Server)` }));

            return {
                data,
                totalRows: data.length,
                page: params.page,
                pageSize: params.pageSize
            };
        }
    }), []);

    const itemDataSource = useMemo(() => ({
        getRows: async (params: any) => {
            await new Promise(resolve => setTimeout(resolve, 500));

            let data = ITEMS.map(i => ({ ...i, name: `${i.name} (Server)` }));

            const catFilter = params.filterModel?.find((f: any) => f.field === 'categoryId');
            if (catFilter) {
                data = data.filter(i => i.categoryId === catFilter.value);
            }

            return {
                data,
                totalRows: data.length,
                page: params.page,
                pageSize: params.pageSize
            };
        }
    }), []);

    const handleReset = useCallback(() => {
        const catApi = getGridApi('grid-categories');
        const itemApi = getGridApi('grid-items');

        // Use new Builder API for cleaner reset
        catApi?.params().resetState().execute();
        itemApi?.params().resetState().execute();
        catApi?.params().resetState().execute();
        itemApi?.params().resetState().execute();
    }, [getGridApi]);

    const handleRefresh = useCallback(() => {
        const catApi = getGridApi('grid-categories');
        const itemApi = getGridApi('grid-items');

        catApi?.refresh();
        itemApi?.refresh();
    }, [getGridApi]);

    const handleCategoryClick = useCallback((e: any) => {
        const catApi = getGridApi('grid-categories');
        const itemApi = getGridApi('grid-items');
        const categoryId = e.rowData.id;

        requestAnimationFrame(() => {
            const selectedRows = catApi?.getSelectedRows() || [];
            const isSelected = selectedRows.some((row: any) => row.data.id === categoryId);

            if (isSelected && itemApi) {
                itemApi.params()
                    .setFilterModel([{
                        field: 'categoryId',
                        filterType: 'text',
                        operator: 'equals',
                        value: categoryId
                    }])
                    .execute();
            } else if (itemApi) {
                itemApi.params().setFilterModel([]).execute();
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
                    // Use Builder API
                    catApi.params()
                        .setFilterModel([{
                            field: 'id',
                            filterType: 'text',
                            operator: 'equals',
                            value: categoryId
                        }])
                        .execute();
                }

                if (itemApi) {
                    itemApi.params()
                        .setFilterModel([{
                            field: 'categoryId',
                            filterType: 'text',
                            operator: 'equals',
                            value: categoryId
                        }], { behavior: 'merge' }) // Demonstrate merge behavior
                        .execute();
                }
            } else {
                catApi?.params().setFilterModel([]).execute();
                itemApi?.params().setFilterModel([]).execute();
            }
        });
    }, [getGridApi]);

    return (
        <Card className="mt-8 border-primary/20 shadow-parchment">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-display text-gradient-gold">
                    Linked Grids Registry Demo {useServerSide ? '(Server Mode)' : '(Client Mode)'}
                </CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Reset Interaction
                    </Button>
                    <Button onClick={handleRefresh} variant="secondary" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh Data
                    </Button>
                    <Button
                        onClick={() => {
                            const catApi = getGridApi('grid-categories');
                            // Set a filter first to demonstrate removal (optional, or just rely on user typing)
                            if (catApi) {
                                catApi.params().removeQuickFilter().execute();
                            }
                        }}
                        variant="outline"
                        size="sm"
                    >
                        Clear Quick Filter (API)
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="font-semibold text-muted-foreground">Categories (Master)</h3>
                    <div className="h-[300px] border rounded-md overflow-hidden">
                        <FiboGrid
                            gridId="grid-categories"
                            rowData={useServerSide ? [] : CATEGORIES}
                            serverSideDataSource={useServerSide ? categoryDataSource : undefined}
                            paginationMode={useServerSide ? 'server' : 'client'}
                            pagination={true}
                            paginationPageSize={10}
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
                            rowData={useServerSide ? [] : ITEMS}
                            serverSideDataSource={useServerSide ? itemDataSource : undefined}
                            paginationMode={useServerSide ? 'server' : 'client'}
                            pagination={true}
                            paginationPageSize={10}
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
