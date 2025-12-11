import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Link2 } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { Check } from 'lucide-react';

export const Advanced = ({ activeSection }: { activeSection: string }) => {
    return (
        <>
            {activeSection === 'events' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Events</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Available Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm font-body">
                                    <thead>
                                        <tr className="border-b border-primary/10">
                                            <th className="text-left py-3 px-4 font-display">Event</th>
                                            <th className="text-left py-3 px-4 font-display">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ['onGridReady', 'Fired when grid is initialized, provides API access'],
                                            ['onRowSelected', 'Fired when a row selection changes'],
                                            ['onSelectionChanged', 'Fired when overall selection changes'],
                                            ['onCellClicked', 'Fired when a cell is clicked'],
                                            ['onCellDoubleClicked', 'Fired when a cell is double-clicked'],
                                            ['onCellValueChanged', 'Fired when a cell value is edited'],
                                            ['onSortChanged', 'Fired when sort model changes'],
                                            ['onFilterChanged', 'Fired when filter model changes'],
                                            ['onColumnResized', 'Fired when column width changes'],
                                            ['onColumnMoved', 'Fired when column is reordered'],
                                            ['onRowDragStart', 'Fired when row drag begins'],
                                            ['onRowDragEnd', 'Fired when row drag completes'],
                                            ['onPaginationChanged', 'Fired when page or page size changes'],
                                        ].map(([event, desc], i) => (
                                            <tr key={i} className="border-b border-primary/5">
                                                <td className="py-3 px-4 font-mono text-primary">{event}</td>
                                                <td className="py-3 px-4">{desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Event Usage Example</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CodeBlock code={`<FiboGrid
  rowData={data}
  columnDefs={columns}
  onGridReady={(event) => {
    setGridApi(event.api);
  }}
  onRowSelected={(event) => {
    console.log('Row selected:', event.rowNode.data);
    console.log('Is selected:', event.selected);
  }}
  onCellValueChanged={(event) => {
    console.log('Value changed');
    console.log('Old:', event.oldValue);
    console.log('New:', event.newValue);
    console.log('Row:', event.rowNode.data);
  }}
  onSortChanged={(event) => {
    console.log('Sort model:', event.sortModel);
  }}
/>`} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'linked-grids' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Linked Grids</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center gap-2">
                                <Link2 className="h-5 w-5 text-primary" />
                                Master-Detail Pattern
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="font-body text-muted-foreground">
                                Use the <strong>Grid Registry</strong> to link multiple grids together. This allows for powerful interaction patterns like Master-Detail views, where selecting a row in one grid automatically controls another.
                            </p>

                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                                <h4 className="font-semibold text-primary mb-2">Setup Required</h4>
                                <p className="text-sm">
                                    Wrap your grid components or the entire application in <code>GridRegistryProvider</code>.
                                </p>
                            </div>

                            <CodeBlock code={`import { GridRegistryProvider, FiboGrid, useGridRegistry } from 'fibogrid';

function App() {
  return (
    <GridRegistryProvider>
      <LinkedGrids />
    </GridRegistryProvider>
  );
}`} />
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Event-Driven Architecture</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="font-body text-sm text-muted-foreground">
                                We recommend an <strong>imperative, event-driven approach</strong> for linking grids. Instead of syncing state with effects, use events to directly command other grids.
                            </p>
                            <CodeBlock code={`function LinkedGrids() {
  // 1. Get registry hook
  const { getGridApi } = useGridRegistry();

  // 2. Define event handler
  const handleMasterSelect = (event) => {
    // 3. Get API of the other grid by ID
    const detailApi = getGridApi('detail-grid');

    if (detailApi && event.selected) {
       // 4. Command the detail grid directly
       detailApi.setFilterModel([
         { 
           field: 'categoryId', 
           filterType: 'text', 
           operator: 'equals', 
           value: event.rowNode.data.id 
         }
       ]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* MASTER GRID */}
      <FiboGrid
        gridId="master-grid"
        rowData={categories}
        columnDefs={categoryColumns}
        rowSelection="single"
        onRowSelected={handleMasterSelect}
      />
      
      {/* DETAIL GRID */}
      <FiboGrid
        gridId="detail-grid"
        rowData={items}
        columnDefs={itemColumns}
      />
    </div>
  );
}`} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'performance' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Performance</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                Optimizing for Large Datasets
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="font-body">FiboGrid is optimized for 100k+ rows out of the box:</p>
                            <ul className="space-y-3 font-body">
                                {[
                                    'Virtual scrolling renders only visible rows',
                                    'RAF-throttled scroll handlers for 60fps',
                                    'Memoized row components with smart comparison',
                                    'Efficient state updates with refs',
                                    'Row transition animations for real-time updates',
                                    'Automatic row reordering when data changes',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="h-5 w-5 rounded bg-gradient-gold flex items-center justify-center shadow-gold">
                                            <Check className="h-3 w-3 text-primary-foreground" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <CodeBlock code={`// Best practices for large datasets:

// 1. Use stable getRowId function
const getRowId = useCallback((row) => row.id, []);

// 2. Memoize column definitions
const columns = useMemo(() => [...], []);

// 3. Use pagination for very large datasets
<FiboGrid
  rowData={largeData}
  columnDefs={columns}
  pagination={true}
  paginationPageSize={100}
/>

// 4. Real-time updates are handled efficiently
// Rows automatically animate to new positions
// when data changes`} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'api' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Grid API</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Accessing the API</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CodeBlock code={`const [gridApi, setGridApi] = useState<GridApi | null>(null);

<FiboGrid
  rowData={data}
  columnDefs={columns}
  onGridReady={(event) => {
    setGridApi(event.api);
  }}
/>`} />
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">API Methods</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-display font-semibold text-lg mb-3 text-primary">Data Methods</h4>
                                <CodeBlock code={`gridApi.getRowData()           // Get all row data
gridApi.getDisplayedRows()      // Get visible rows
gridApi.getRowNode(id)          // Get row by ID
gridApi.forEachNode(callback)   // Iterate all rows
gridApi.updateRowData({ add, update, remove })  // Batch updates`} />
                            </div>

                            <div>
                                <h4 className="font-display font-semibold text-lg mb-3 text-primary">Selection Methods</h4>
                                <CodeBlock code={`gridApi.getSelectedRows()       // Get selected rows
gridApi.selectAll()             // Select all
gridApi.deselectAll()           // Deselect all
gridApi.selectRow(id, true)     // Select specific row
gridApi.selectRows(ids, true)   // Select multiple rows`} />
                            </div>

                            <div>
                                <h4 className="font-display font-semibold text-lg mb-3 text-primary">Column Methods</h4>
                                <CodeBlock code={`gridApi.setColumnVisible(field, visible)
gridApi.setColumnPinned(field, 'left' | 'right' | null)
gridApi.resizeColumn(field, width)
gridApi.autoSizeColumn(field)
gridApi.autoSizeAllColumns()
gridApi.moveColumn(fromIndex, toIndex)`} />
                            </div>

                            <div>
                                <h4 className="font-display font-semibold text-lg mb-3 text-primary">Sort & Filter</h4>
                                <CodeBlock code={`gridApi.setSortModel([{ field: 'name', direction: 'asc' }])
gridApi.getSortModel()
gridApi.setFilterModel([...])
gridApi.getFilterModel()
gridApi.setQuickFilter('search text')`} />
                            </div>

                            <div>
                                <h4 className="font-display font-semibold text-lg mb-3 text-primary">Scroll & Navigation</h4>
                                <CodeBlock code={`gridApi.ensureRowVisible(id)     // Scroll to row
gridApi.ensureColumnVisible(field)  // Scroll to column
gridApi.scrollTo({ top: 0, left: 0 })`} />
                            </div>

                            <div>
                                <h4 className="font-display font-semibold text-lg mb-3 text-primary">Export</h4>
                                <CodeBlock code={`gridApi.exportToCsv({ fileName: 'data.csv' })
gridApi.copyToClipboard(includeHeaders)`} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};
