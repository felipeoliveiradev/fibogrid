import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { ExampleBlock } from '../components/ExampleBlock';
import { FiboGrid } from 'fibogrid';

export const Pagination = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Pagination</h1>
                <p className="text-lg text-muted-foreground">
                    Split large datasets into pages for better navigation and performance.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Client-Side Pagination</h2>
                <p className="text-muted-foreground">
                    For medium-sized datasets, load all data into the grid and let FiboGrid handle the paging logic.
                </p>
                <ExampleBlock
                    code={`<FiboGrid
  rowData={allData} // 1000 items
  columnDefs={columns}
  pagination={true}
  paginationPageSize={10}
  paginationPageSizeOptions={[10, 20, 50, 100]}
/>`}
                    preview={
                        <div className="h-[300px]">
                            <FiboGrid
                                rowData={Array.from({ length: 100 }, (_, i) => ({
                                    id: i,
                                    item: `Item ${i + 1}`,
                                    value: Math.floor(Math.random() * 1000)
                                }))}
                                columnDefs={[
                                    { field: 'id', headerName: 'ID', width: 80 },
                                    { field: 'item', headerName: 'Item Name', flex: 1 },
                                    { field: 'value', headerName: 'Value', width: 100 },
                                ]}
                                pagination={true}
                                paginationPageSize={5}
                            />
                        </div>
                    }
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Pagination Props</h2>
                <ApiTable items={[
                    { name: 'pagination', type: 'boolean', default: 'false', description: 'Enable pagination.' },
                    { name: 'paginationPageSize', type: 'number', default: '20', description: 'Number of rows per page.' },
                    { name: 'paginationPageSizeOptions', type: 'number[]', default: '[20, 50, 100]', description: 'Options for the page size selector.' },
                    { name: 'paginationMode', type: "'client' | 'server'", default: "'client'", description: 'Whether to page locally or fetch from server.' },
                ]} />
            </div>
        </div>
    );
};
