import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { ExampleBlock } from '../components/ExampleBlock';
import { CodeBlock } from '../components/CodeBlock';
import { FiboGrid } from 'fibogrid';
import { Filter, Search } from 'lucide-react';

export const Filtering = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Filtering</h1>
                <p className="text-lg text-muted-foreground">
                    Powerful Excel-style filtering capabilities, from global search to column-specific predicates.
                </p>
            </div>

            {/* Quick Filter */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Quick Search
                </h2>
                <p className="text-muted-foreground">
                    Filter across all visible columns instantly by passing a string to <code className="text-primary">quickFilterText</code>.
                </p>
                <ExampleBlock
                    code={`const [searchText, setSearchText] = useState('');

<input 
  value={searchText} 
  onChange={e => setSearchText(e.target.value)} 
  placeholder="Search..."
/>

<FiboGrid
  rowData={data}
  columnDefs={columns}
  quickFilterText={searchText}
/>`}
                    preview={
                        <div className="h-[200px]">
                            <FiboGrid
                                rowData={[
                                    { id: 1, name: 'Apple MacBook Pro', category: 'Electronics', price: 1999 },
                                    { id: 2, name: 'Ergonomic Chair', category: 'Furniture', price: 450 },
                                    { id: 3, name: 'USB-C Cable', category: 'Accessories', price: 19 },
                                ]}
                                columnDefs={[
                                    { field: 'name', headerName: 'Product', flex: 1 },
                                    { field: 'category', headerName: 'Category', width: 150 },
                                    { field: 'price', headerName: 'Price', width: 100 },
                                ]}
                                quickFilterText="Mac"
                                showToolbar={true}
                            />
                        </div>
                    }
                />
            </div>

            {/* Column Filters */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Column Filters
                </h2>
                <p className="text-muted-foreground">
                    Enable standard filters by setting <code className="text-primary">filterable: true</code> on a column definition.
                </p>
                <ApiTable items={[
                    { name: 'filterable', type: 'boolean', default: 'false', description: 'Enable filtering menu for this column.' },
                    { name: 'filterType', type: "'text' | 'number' | 'date' | 'set' | 'boolean'", default: "'text'", description: 'The type of filter UI to show.' },
                    { name: 'filterParams', type: 'object', description: 'Configuration specific to the filter type (e.g. values for set filter).' },
                ]} />

                <h3 className="text-lg font-medium mt-6 mb-2">Filter Types</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <CodeBlock code={`// Text Filter (Default)
{ 
  field: 'name', 
  filterable: true 
}`} />
                    <CodeBlock code={`// Number Filter
{ 
  field: 'age', 
  filterable: true, 
  filterType: 'number' 
}`} />
                    <CodeBlock code={`// Date Filter
{ 
  field: 'dob', 
  filterable: true, 
  filterType: 'date' 
}`} />
                    <CodeBlock code={`// Set Filter (Checkboxes)
{ 
  field: 'status', 
  filterable: true, 
  filterType: 'set',
  filterParams: {
    values: ['Active', 'Suspended', 'Deleted']
  }
}`} />
                </div>
            </div>
        </div>
    );
};
