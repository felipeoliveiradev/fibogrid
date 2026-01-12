import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { FileCode, Database, Sliders } from 'lucide-react';

export const Interfaces = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Key Interfaces</h1>
                <p className="text-lg text-muted-foreground">
                    Common type definitions you will use when configuring FiboGrid.
                </p>
            </div>

            {/* ColumnDef */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-display font-semibold">ColumnDef</h2>
                </div>
                <p className="text-muted-foreground">
                    The configuration object for a single column.
                </p>
                <CodeBlock
                    code={`interface ColumnDef<T = any> {
  field: string;           // Key in data object
  headerName?: string;     // Display title
  width?: number;          // Fixed width (px)
  flex?: number;           // Flex grow factor
  hide?: boolean;          // Hidden by default
  pinned?: 'left'|'right'; // Sticky column
  sortable?: boolean;      // Enable sorting
  filterable?: boolean;    // Enable filtering
  editable?: boolean;      // Enable editing
  
  // Custom Rendering
  cellRenderer?: (params: CellRendererParams<T>) => React.ReactNode;
  valueFormatter?: (value: any, data: T) => string;
  
  // Styling
  cellClass?: string | ((params: any) => string);
  cellClassRules?: Record<string, (params: any) => boolean>;
}`}
                />
                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Usage Example</h3>
                <CodeBlock
                    code={`const priceColumn: ColumnDef<Product> = {
  field: 'price',
  headerName: 'Sale Price',
  width: 120,
  sortable: true,
  valueFormatter: (val) => \`\$\${val.toFixed(2)}\`,
  cellClass: (params) => params.value > 100 ? 'text-red-500' : 'text-green-500'
};`}
                    language="typescript"
                />
            </div>

            {/* RowNode */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-display font-semibold">RowNode</h2>
                </div>
                <p className="text-muted-foreground">
                    The internal wrapper around your data. Passed to events and callbacks.
                </p>
                <CodeBlock
                    code={`interface RowNode<T = any> {
  id: string;          // Unique ID
  data: T;             // Your original data object
  rowIndex: number;    // Current display index
  selected: boolean;   // Selection state
  
  // Tree Data
  parent?: RowNode<T>;
  children?: RowNode<T>[];
  expanded?: boolean;
}`}
                />
            </div>

            {/* FilterModel */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-display font-semibold">FilterModel</h2>
                </div>
                <p className="text-muted-foreground">
                    The state object for an active column filter.
                </p>
                <CodeBlock
                    code={`interface FilterModel {
  field: string;
  filterType: 'text' | 'number' | 'date' | 'set';
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' // ... etc 
}`}
                />
                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Usage Example</h3>
                <CodeBlock
                    code={`// Set programmatically via API
gridApi.setFilterModel([
  {
    field: 'status',
    filterType: 'set',
    value: ['Active', 'Pending']
  },
  {
    field: 'revenue',
    filterType: 'number',
    operator: 'greaterThan',
    value: 1000
  }
]);`}
                    language="typescript"
                />
            </div>
        </div>
    );
};
