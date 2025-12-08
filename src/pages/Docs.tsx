import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DataGrid } from '@/components/DataGrid';
import { ColumnDef } from '@/components/DataGrid/types';
import { 
  ArrowLeft, Copy, Check, BookOpen, Code, Zap, Settings, Layers, 
  Filter, ArrowUpDown, Pin, Edit3, Download, Move, Hexagon, 
  Eye, Package, Palette, Bell, Link2, Terminal
} from 'lucide-react';

// FiboGrid Logo Component
const FiboLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(42 70% 55%)" />
        <stop offset="50%" stopColor="hsl(40 65% 45%)" />
        <stop offset="100%" stopColor="hsl(38 60% 35%)" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="34" height="34" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="2"/>
    <rect x="44" y="10" width="21" height="21" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
    <rect x="44" y="31" width="13" height="13" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
    <rect x="57" y="31" width="8" height="8" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
    <rect x="10" y="50" width="55" height="40" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="3"/>
    <line x1="10" y1="60" x2="65" y2="60" stroke="url(#goldGradient)" strokeWidth="1.5"/>
    <line x1="10" y1="70" x2="65" y2="70" stroke="url(#goldGradient)" strokeWidth="1"/>
    <line x1="10" y1="80" x2="65" y2="80" stroke="url(#goldGradient)" strokeWidth="1"/>
    <line x1="30" y1="50" x2="30" y2="90" stroke="url(#goldGradient)" strokeWidth="1"/>
    <line x1="50" y1="50" x2="50" y2="90" stroke="url(#goldGradient)" strokeWidth="1"/>
    <circle cx="80" cy="70" r="12" stroke="url(#goldGradient)" strokeWidth="2" fill="none"/>
    <circle cx="80" cy="70" r="7" stroke="url(#goldGradient)" strokeWidth="1.5" fill="hsl(40 65% 45% / 0.2)"/>
  </svg>
);

const CodeBlock = ({ code, language = 'tsx' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <pre className="paper-aged rounded-lg p-4 overflow-x-auto text-sm font-mono border border-primary/10">
        <code className="text-foreground/90">{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className={`absolute top-2 right-2 h-8 w-8 p-0 transition-all duration-200 ${
          copied 
            ? 'bg-primary/20 text-primary opacity-100' 
            : 'opacity-0 group-hover:opacity-100 hover:bg-primary/10'
        }`}
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      {copied && (
        <span className="absolute top-2 right-12 text-xs text-primary font-body bg-primary/10 px-2 py-1 rounded animate-fade-in">
          Copied!
        </span>
      )}
    </div>
  );
};

// Example Component with Code + Preview tabs
interface ExampleBlockProps {
  title: string;
  description?: string;
  code: string;
  preview: React.ReactNode;
  previewHeight?: number;
}

const ExampleBlock = ({ title, description, code, preview, previewHeight = 300 }: ExampleBlockProps) => {
  return (
    <Card className="paper-aged border-primary/10 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground font-body">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="bg-primary/5 border border-primary/10">
            <TabsTrigger value="preview" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground gap-2">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div 
              className="border border-primary/10 rounded-lg overflow-hidden bg-card"
              style={{ height: previewHeight }}
            >
              {preview}
            </div>
          </TabsContent>
          <TabsContent value="code" className="mt-4">
            <CodeBlock code={code} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const sections = [
  { id: 'installation', title: 'Installation', icon: Package },
  { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
  { id: 'basic-usage', title: 'Basic Usage', icon: Code },
  { id: 'columns', title: 'Column Definitions', icon: Layers },
  { id: 'sorting', title: 'Sorting', icon: ArrowUpDown },
  { id: 'filtering', title: 'Filtering', icon: Filter },
  { id: 'selection', title: 'Row Selection', icon: Settings },
  { id: 'editing', title: 'Inline Editing', icon: Edit3 },
  { id: 'pinning', title: 'Column Pinning', icon: Pin },
  { id: 'grouping', title: 'Row Grouping', icon: Layers },
  { id: 'drag-drop', title: 'Drag & Drop', icon: Move },
  { id: 'export', title: 'Export', icon: Download },
  { id: 'events', title: 'Events', icon: Bell },
  { id: 'theming', title: 'Theming', icon: Palette },
  { id: 'linked-grids', title: 'Linked Grids', icon: Link2 },
  { id: 'performance', title: 'Performance', icon: Zap },
  { id: 'api', title: 'Grid API', icon: Terminal },
];

// Sample data for previews
const sampleData = [
  { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active', price: 1500, category: 'Art' },
  { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active', price: 2200, category: 'Sculpture' },
  { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending', price: 1800, category: 'Art' },
  { id: '4', name: 'Donatello', email: 'don@florence.com', status: 'Inactive', price: 900, category: 'Sculpture' },
  { id: '5', name: 'Botticelli', email: 'bot@spring.com', status: 'Active', price: 3100, category: 'Art' },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('installation');

  // Basic columns for preview
  const basicColumns: ColumnDef<typeof sampleData[0]>[] = useMemo(() => [
    { field: 'name', headerName: 'Name', sortable: true, width: 140 },
    { field: 'email', headerName: 'Email', sortable: true, width: 180 },
    { field: 'status', headerName: 'Status', width: 100 },
  ], []);

  // Columns with custom renderer
  const statusColumns: ColumnDef<typeof sampleData[0]>[] = useMemo(() => [
    { field: 'name', headerName: 'Name', sortable: true, width: 140 },
    { field: 'email', headerName: 'Email', width: 180 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      cellRenderer: ({ value }) => {
        const colors: Record<string, string> = {
          Active: 'bg-green-600/20 text-green-700 dark:text-green-400',
          Pending: 'bg-amber-600/20 text-amber-700 dark:text-amber-400',
          Inactive: 'bg-red-600/20 text-red-700 dark:text-red-400',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[value] || ''}`}>
            {value}
          </span>
        );
      }
    },
  ], []);

  // Sortable columns
  const sortableColumns: ColumnDef<typeof sampleData[0]>[] = useMemo(() => [
    { field: 'name', headerName: 'Name', sortable: true, width: 140 },
    { field: 'price', headerName: 'Price', sortable: true, width: 100 },
    { field: 'category', headerName: 'Category', sortable: true, width: 120 },
  ], []);

  // Filterable columns
  const filterColumns: ColumnDef<typeof sampleData[0]>[] = useMemo(() => [
    { field: 'name', headerName: 'Name', filterable: true, filterType: 'text', width: 140 },
    { field: 'price', headerName: 'Price', filterable: true, filterType: 'number', width: 100 },
    { field: 'status', headerName: 'Status', filterable: true, filterType: 'select', width: 120 },
  ], []);

  // Editable columns
  const editableColumns: ColumnDef<typeof sampleData[0]>[] = useMemo(() => [
    { field: 'name', headerName: 'Name', editable: true, cellEditor: 'text', width: 140 },
    { field: 'price', headerName: 'Price', editable: true, cellEditor: 'number', width: 100 },
    { field: 'status', headerName: 'Status', editable: true, cellEditor: 'select', cellEditorParams: { values: ['Active', 'Pending', 'Inactive'] }, width: 120 },
  ], []);

  // Pinned columns
  const pinnedColumns: ColumnDef<typeof sampleData[0]>[] = useMemo(() => [
    { field: 'id', headerName: 'ID', pinned: 'left', width: 60 },
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'status', headerName: 'Status', pinned: 'right', width: 100 },
  ], []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Texture overlay */}
      <div className="fixed inset-0 texture-overlay pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <FiboLogo className="h-8 w-8" />
              <span className="font-display font-bold text-xl">FiboGrid</span>
            </Link>
            <Badge className="bg-primary/10 text-primary border-primary/30 font-body">
              <Hexagon className="h-3 w-3 mr-1" />
              Documentation
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="font-body hover:bg-primary/5" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <ThemeToggle />
            <Button size="sm" className="bg-gradient-gold text-primary-foreground shadow-gold font-body" asChild>
              <Link to="/demo">Live Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <Card className="paper-aged border-primary/10 h-full">
              <ScrollArea className="h-full p-4">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 font-body ${
                        activeSection === section.id
                          ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </Card>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="prose prose-neutral dark:prose-invert max-w-none pr-4">
                
                {activeSection === 'installation' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-gold">Installation</h1>
                      <p className="text-lg text-muted-foreground font-body leading-relaxed">
                        Get started with FiboGrid in minutes. Install the package and start building beautiful data grids.
                      </p>
                    </div>

                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          Package Installation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="font-body text-muted-foreground">Install FiboGrid using your preferred package manager:</p>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-mono text-primary mb-2">npm</p>
                            <CodeBlock code="npm install fibogrid" />
                          </div>
                          <div>
                            <p className="text-sm font-mono text-primary mb-2">yarn</p>
                            <CodeBlock code="yarn add fibogrid" />
                          </div>
                          <div>
                            <p className="text-sm font-mono text-primary mb-2">pnpm</p>
                            <CodeBlock code="pnpm add fibogrid" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 font-body">
                          {[
                            { label: 'React', version: '>= 18.0.0' },
                            { label: 'TypeScript', version: '>= 4.7 (optional)' },
                            { label: 'Tailwind CSS', version: '>= 3.0 (for default styles)' },
                          ].map((req, i) => (
                            <li key={i} className="flex items-center justify-between border-b border-primary/5 pb-2">
                              <span>{req.label}</span>
                              <Badge variant="outline" className="border-primary/30 font-mono text-xs">
                                {req.version}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'getting-started' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-gold">Getting Started</h1>
                      <p className="text-lg text-muted-foreground font-body leading-relaxed">
                        FiboGrid is a high-performance React data grid component with features comparable to AG Grid, 
                        inspired by Da Vinci's pursuit of mathematical perfection.
                      </p>
                    </div>

                    <ExampleBlock
                      title="Quick Start"
                      description="Import the DataGrid component and pass your data to get started immediately."
                      code={`import { DataGrid } from 'fibogrid';
import { ColumnDef } from 'fibogrid/types';

const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'email', headerName: 'Email', sortable: true },
  { field: 'status', headerName: 'Status' },
];

const data = [
  { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active' },
  { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active' },
  { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending' },
];

function MyGrid() {
  return (
    <DataGrid
      rowData={data}
      columnDefs={columns}
      getRowId={(row) => row.id}
      rowSelection="multiple"
    />
  );
}`}
                      preview={
                        <DataGrid
                          rowData={sampleData.slice(0, 3)}
                          columnDefs={basicColumns}
                          getRowId={(row) => row.id}
                          rowSelection="multiple"
                        />
                      }
                    />

                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl flex items-center gap-2">
                          <Hexagon className="h-5 w-5 text-primary" />
                          Core Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 font-body">
                          {[
                            'Virtual scrolling for 100k+ rows',
                            'Multi-column sorting',
                            'Advanced filtering with Excel-style UI',
                            'Column pinning (left/right)',
                            'Row grouping with aggregations',
                            'Inline cell editing',
                            'CSV/Excel export',
                            'Real-time data updates with animations',
                            'Linked grids for master-detail views',
                          ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <div className="h-5 w-5 rounded bg-gradient-gold flex items-center justify-center shadow-gold">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'basic-usage' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Basic Usage</h1>
                    
                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">DataGrid Props</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm font-body">
                            <thead>
                              <tr className="border-b border-primary/10">
                                <th className="text-left py-3 px-4 font-display">Prop</th>
                                <th className="text-left py-3 px-4 font-display">Type</th>
                                <th className="text-left py-3 px-4 font-display">Default</th>
                                <th className="text-left py-3 px-4 font-display">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                ['rowData', 'T[]', '-', 'Array of data objects'],
                                ['columnDefs', 'ColumnDef[]', '-', 'Column definitions'],
                                ['getRowId', '(data) => string', '-', 'Function to get unique row ID'],
                                ['height', 'number | string', "'100%'", 'Grid height'],
                                ['rowSelection', "'single' | 'multiple'", '-', 'Enable row selection'],
                                ['pagination', 'boolean', 'false', 'Enable pagination'],
                                ['rowHeight', 'number', '40', 'Height of each row in pixels'],
                                ['showToolbar', 'boolean', 'false', 'Show toolbar with search/export'],
                                ['showStatusBar', 'boolean', 'false', 'Show status bar with counts'],
                                ['loading', 'boolean', 'false', 'Show loading overlay'],
                              ].map(([prop, type, def, desc], i) => (
                                <tr key={i} className="border-b border-primary/5">
                                  <td className="py-3 px-4 font-mono text-primary">{prop}</td>
                                  <td className="py-3 px-4 font-mono text-muted-foreground">{type}</td>
                                  <td className="py-3 px-4 text-muted-foreground">{def}</td>
                                  <td className="py-3 px-4">{desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'columns' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Column Definitions</h1>
                    
                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">ColumnDef Interface</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`interface ColumnDef<T = any> {
  field: string;                    // Data field key
  headerName: string;               // Column header text
  width?: number;                   // Fixed width in pixels
  minWidth?: number;                // Minimum width
  maxWidth?: number;                // Maximum width
  flex?: number;                    // Flex grow factor
  sortable?: boolean;               // Enable sorting
  filterable?: boolean;             // Enable filtering
  resizable?: boolean;              // Enable resize
  editable?: boolean;               // Enable inline editing
  pinned?: 'left' | 'right';        // Pin column
  hide?: boolean;                   // Hide column
  
  // Custom renderers
  cellRenderer?: (params) => React.ReactNode;
  headerRenderer?: (params) => React.ReactNode;
  valueFormatter?: (value, row) => string;
  
  // Editing
  cellEditor?: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  cellEditorParams?: { values?: string[] };
  
  // Aggregations
  aggFunc?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}`} />
                      </CardContent>
                    </Card>

                    <ExampleBlock
                      title="Custom Cell Renderer"
                      description="Use cellRenderer to create custom cell content with status badges, icons, or any React component."
                      code={`const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'email', headerName: 'Email' },
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: ({ value }) => {
      const colors = {
        Active: 'bg-green-600/20 text-green-700',
        Pending: 'bg-amber-600/20 text-amber-700',
        Inactive: 'bg-red-600/20 text-red-700',
      };
      return (
        <span className={\`px-2 py-0.5 rounded text-xs \${colors[value]}\`}>
          {value}
        </span>
      );
    },
  },
];`}
                      preview={
                        <DataGrid
                          rowData={sampleData}
                          columnDefs={statusColumns}
                          getRowId={(row) => row.id}
                        />
                      }
                    />
                  </div>
                )}

                {activeSection === 'sorting' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Sorting</h1>
                    
                    <p className="text-lg text-muted-foreground font-body">
                      Enable sorting on columns by setting <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">sortable: true</code>.
                      Click column headers to cycle through ascending, descending, and no sort.
                    </p>

                    <ExampleBlock
                      title="Multi-Column Sort"
                      description="Click column headers to sort. Hold Shift and click to add secondary sorts."
                      code={`const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'price', headerName: 'Price', sortable: true },
  { field: 'category', headerName: 'Category', sortable: true },
];

<DataGrid
  rowData={data}
  columnDefs={columns}
  onSortChanged={(event) => {
    console.log('Sort model:', event.sortModel);
  }}
/>`}
                      preview={
                        <DataGrid
                          rowData={sampleData}
                          columnDefs={sortableColumns}
                          getRowId={(row) => row.id}
                        />
                      }
                    />
                  </div>
                )}

                {activeSection === 'filtering' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Filtering</h1>
                    
                    <ExampleBlock
                      title="Filter Types"
                      description="Hover over column headers and click the filter icon to open the filter menu. FiboGrid supports text, number, date, and select filters."
                      code={`const columns: ColumnDef[] = [
  { 
    field: 'name', 
    headerName: 'Name', 
    filterable: true,
    filterType: 'text'  // text, number, date, select, boolean
  },
  { 
    field: 'price', 
    headerName: 'Price', 
    filterable: true,
    filterType: 'number'
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    filterable: true,
    filterType: 'select'  // Shows checkbox list
  },
];`}
                      preview={
                        <DataGrid
                          rowData={sampleData}
                          columnDefs={filterColumns}
                          getRowId={(row) => row.id}
                        />
                      }
                    />
                  </div>
                )}

                {activeSection === 'selection' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Row Selection</h1>
                    
                    <ExampleBlock
                      title="Selection Modes"
                      description="Click rows to select them. Use 'single' for one row at a time, or 'multiple' for multi-select with checkboxes."
                      code={`// Single selection
<DataGrid
  rowData={data}
  columnDefs={columns}
  rowSelection="single"
  onRowSelected={(event) => {
    console.log('Selected:', event.rowNode.data);
  }}
/>

// Multiple selection
<DataGrid
  rowData={data}
  columnDefs={columns}
  rowSelection="multiple"
  onSelectionChanged={(event) => {
    console.log('Selected rows:', event.selectedRows);
  }}
/>

// Access selected rows via API
const selectedRows = gridApi.getSelectedRows();`}
                      preview={
                        <DataGrid
                          rowData={sampleData}
                          columnDefs={basicColumns}
                          getRowId={(row) => row.id}
                          rowSelection="multiple"
                        />
                      }
                    />
                  </div>
                )}

                {activeSection === 'editing' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Inline Editing</h1>
                    
                    <ExampleBlock
                      title="Cell Editors"
                      description="Double-click any cell to edit. FiboGrid supports text, number, select, and checkbox editors."
                      code={`const columns: ColumnDef[] = [
  { 
    field: 'name', 
    headerName: 'Name', 
    editable: true,
    cellEditor: 'text'
  },
  { 
    field: 'price', 
    headerName: 'Price', 
    editable: true,
    cellEditor: 'number'
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    editable: true,
    cellEditor: 'select',
    cellEditorParams: {
      values: ['Active', 'Pending', 'Inactive']
    }
  },
];

<DataGrid
  rowData={data}
  columnDefs={columns}
  onCellValueChanged={(event) => {
    console.log('Changed:', event.oldValue, '->', event.newValue);
  }}
/>`}
                      preview={
                        <DataGrid
                          rowData={sampleData}
                          columnDefs={editableColumns}
                          getRowId={(row) => row.id}
                        />
                      }
                    />
                  </div>
                )}

                {activeSection === 'pinning' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Column Pinning</h1>
                    
                    <ExampleBlock
                      title="Pin Columns"
                      description="Pinned columns stay fixed while scrolling horizontally. ID is pinned left, Status is pinned right."
                      code={`const columns: ColumnDef[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    pinned: 'left'  // Pin to left side
  },
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
  { 
    field: 'status', 
    headerName: 'Status', 
    pinned: 'right'  // Pin to right side
  },
];

// Or pin programmatically via API
gridApi.setColumnPinned('id', 'left');
gridApi.setColumnPinned('actions', 'right');
gridApi.setColumnPinned('email', null);  // Unpin`}
                      preview={
                        <DataGrid
                          rowData={sampleData}
                          columnDefs={pinnedColumns}
                          getRowId={(row) => row.id}
                        />
                      }
                    />
                  </div>
                )}

                {activeSection === 'grouping' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Row Grouping</h1>
                    
                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">Group By Fields</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="font-body text-muted-foreground">
                          Group rows by one or more fields with optional aggregations.
                        </p>
                        <CodeBlock code={`<DataGrid
  rowData={data}
  columnDefs={columns}
  groupByFields={['category', 'status']}
  groupAggregations={{
    price: 'sum',
    quantity: 'avg',
    items: 'count'
  }}
/>`} />
                      </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">Hierarchical Data</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="font-body text-muted-foreground">
                          Support for tree data with expandable parent-child relationships.
                        </p>
                        <CodeBlock code={`<DataGrid
  rowData={data}
  columnDefs={columns}
  treeData={true}
  childRowsField="children"
  // or use a function
  getChildRows={(parent) => fetchChildren(parent.id)}
/>`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'drag-drop' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Drag & Drop</h1>
                    
                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">Row Dragging</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`<DataGrid
  rowData={data}
  columnDefs={columns}
  rowDragEnabled={true}
  rowDragManaged={true}
  onRowDragEnd={(event) => {
    console.log('Moved:', event.rowNode.data);
    console.log('To index:', event.overIndex);
  }}
/>`} />
                      </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">Column Reordering</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`// Enable column drag in column definitions
const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', draggable: true },
  { field: 'email', headerName: 'Email', draggable: true },
];

<DataGrid
  columnDefs={columns}
  onColumnMoved={(event) => {
    console.log('Column moved:', event.column.field);
  }}
/>`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'export' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Export</h1>
                    
                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">Export to CSV/Excel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`// Export to CSV
gridApi.exportToCsv({
  fileName: 'export.csv',
  onlySelected: false,
  skipHeader: false,
});

// Copy to clipboard
await gridApi.copyToClipboard(true);  // Include headers

// For Excel export, use the Excel utility:
import { exportToExcel } from 'fibogrid/utils/excelExport';

exportToExcel(rows, columns, {
  fileName: 'export.xlsx',
  sheetName: 'Data'
});`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

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
                        <CodeBlock code={`<DataGrid
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

                {activeSection === 'theming' && (
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Theming</h1>
                    
                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl flex items-center gap-2">
                          <Palette className="h-5 w-5 text-primary" />
                          Theme Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="font-body text-muted-foreground">
                          FiboGrid supports light, dark, and auto themes. The grid automatically inherits your app's design system.
                        </p>
                        <CodeBlock code={`<DataGrid
  rowData={data}
  columnDefs={columns}
  theme="auto"  // 'light' | 'dark' | 'auto'
  className="custom-grid-class"
/>`} />
                      </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">CSS Variables</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`/* Override grid colors with CSS variables */
.fibogrid {
  --grid-background: hsl(var(--background));
  --grid-foreground: hsl(var(--foreground));
  --grid-border: hsl(var(--border));
  --grid-header-bg: hsl(var(--muted));
  --grid-row-hover: hsl(var(--accent));
  --grid-row-selected: hsl(var(--primary) / 0.1);
  --grid-cell-focus: hsl(var(--ring));
}`} />
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
                          Create linked grids where selecting a row in one grid filters or populates another grid.
                        </p>
                        <CodeBlock code={`// Master grid (users)
const [selectedUser, setSelectedUser] = useState(null);

<DataGrid
  gridId="users-grid"
  rowData={users}
  columnDefs={userColumns}
  rowSelection="single"
  onRowSelected={(event) => {
    setSelectedUser(event.rowNode.data);
  }}
/>

// Detail grid (orders for selected user)
<DataGrid
  gridId="orders-grid"
  rowData={selectedUser ? orders.filter(o => o.userId === selectedUser.id) : []}
  columnDefs={orderColumns}
/>`} />
                      </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">Grid Registry</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`// Use gridId for cross-grid communication
import { useGridRegistry } from 'fibogrid';

function Dashboard() {
  const { getGridApi } = useGridRegistry();
  
  const syncGrids = () => {
    const usersApi = getGridApi('users-grid');
    const ordersApi = getGridApi('orders-grid');
    
    const selected = usersApi.getSelectedRows();
    // Update orders grid based on selection
  };
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
<DataGrid
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

<DataGrid
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
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  );
}
