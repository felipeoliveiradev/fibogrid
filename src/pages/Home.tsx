import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@/components/DataGrid';
import { ColumnDef, GridApi } from '@/components/DataGrid/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  Table2, 
  Filter, 
  ArrowUpDown, 
  Columns, 
  CheckSquare, 
  Move, 
  Edit3, 
  Download, 
  Pin,
  Search,
  Layers,
  ArrowRight,
  Github,
  BookOpen,
  Play,
  Sparkles,
  BarChart3,
  Clock,
  Shield
} from 'lucide-react';

// Demo data
const generateDemoData = (count: number) => {
  const products = ['Laptop Pro', 'Wireless Mouse', 'USB-C Hub', 'Monitor 27"', 'Keyboard', 'Webcam HD', 'Headphones', 'SSD 1TB'];
  const categories = ['Electronics', 'Accessories', 'Storage', 'Audio', 'Peripherals'];
  const statuses = ['In Stock', 'Low Stock', 'Out of Stock'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `prod-${i + 1}`,
    name: products[i % products.length] + ` ${i + 1}`,
    category: categories[i % categories.length],
    price: Math.round((Math.random() * 500 + 50) * 100) / 100,
    stock: Math.floor(Math.random() * 200),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    sales: Math.floor(Math.random() * 1000),
  }));
};

const features = [
  { icon: Zap, title: 'Blazing Fast', description: 'Optimized for 100k+ rows with virtual scrolling' },
  { icon: ArrowUpDown, title: 'Multi-Column Sort', description: 'Sort by multiple columns with priority order' },
  { icon: Filter, title: 'Advanced Filtering', description: 'Excel-style filtering with conditions' },
  { icon: Pin, title: 'Column Pinning', description: 'Pin columns left or right with solid backgrounds' },
  { icon: Columns, title: 'Column Management', description: 'Resize, reorder, hide, and auto-fit columns' },
  { icon: CheckSquare, title: 'Row Selection', description: 'Single/multi select with checkbox support' },
  { icon: Move, title: 'Drag & Drop', description: 'Reorder rows and columns via drag' },
  { icon: Edit3, title: 'Inline Editing', description: 'Edit cells directly with various editors' },
  { icon: Layers, title: 'Row Grouping', description: 'Group rows with aggregations' },
  { icon: Search, title: 'Quick Search', description: 'Global search across all columns' },
  { icon: Download, title: 'Export', description: 'Export to CSV and Excel formats' },
  { icon: BarChart3, title: 'Real-time Updates', description: 'Optimized for live data streaming' },
];

const stats = [
  { value: '100k+', label: 'Rows Supported' },
  { value: '60fps', label: 'Scroll Performance' },
  { value: '<16ms', label: 'Render Time' },
  { value: '0', label: 'Dependencies' },
];

export default function Home() {
  const [demoData] = useState(() => generateDemoData(50));
  const [gridApi, setGridApi] = useState<GridApi<any> | null>(null);

  const columns: ColumnDef<any>[] = useMemo(() => [
    { 
      field: 'name', 
      headerName: 'Product Name', 
      width: 180, 
      sortable: true, 
      filterable: true,
      pinned: 'left',
      cellRenderer: (params) => (
        <span className="font-medium text-foreground">{params.value}</span>
      ),
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 120, 
      sortable: true, 
      filterable: true,
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 100, 
      sortable: true,
      valueFormatter: (v) => `$${v.toFixed(2)}`,
      cellRenderer: (params) => (
        <span className="font-mono">${(params.value as number).toFixed(2)}</span>
      ),
    },
    { 
      field: 'stock', 
      headerName: 'Stock', 
      width: 80, 
      sortable: true,
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 110,
      cellRenderer: (params) => {
        const colors: Record<string, string> = {
          'In Stock': 'bg-green-500/20 text-green-400',
          'Low Stock': 'bg-yellow-500/20 text-yellow-400',
          'Out of Stock': 'bg-red-500/20 text-red-400',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[params.value as string]}`}>
            {params.value as string}
          </span>
        );
      },
    },
    { 
      field: 'rating', 
      headerName: 'Rating', 
      width: 80,
      cellRenderer: (params) => (
        <span className="text-yellow-500">★ {params.value}</span>
      ),
    },
    { 
      field: 'sales', 
      headerName: 'Sales', 
      width: 90,
      sortable: true,
      valueFormatter: (v) => v.toLocaleString(),
    },
  ], []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">LovGrid</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link to="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </Link>
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Open Source React Data Grid
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              The Best React Data Grid
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A powerful, performant, and feature-rich data grid built with React. 
              Handle 100k+ rows with ease, real-time updates, and AG Grid-like functionality.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/demo">
                  <Play className="h-4 w-4 mr-2" />
                  Live Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/docs">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Interactive Demo Grid */}
          <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none z-10" />
            <DataGrid
              rowData={demoData}
              columnDefs={columns}
              getRowId={(d) => d.id}
              rowSelection="multiple"
              height={400}
              showToolbar={false}
              showStatusBar={false}
              pagination={false}
              onGridReady={(e) => setGridApi(e.api)}
            />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with performance and developer experience in mind. Every feature you'd expect from a premium data grid.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Clock className="h-3 w-3 mr-1" />
                Performance
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Scale</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Optimized virtual scrolling and intelligent memoization ensure smooth 60fps scrolling 
                even with 100,000+ rows. Real-time data updates are seamlessly handled without 
                performance degradation.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="h-3 w-3 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Virtual Scrolling</div>
                    <div className="text-sm text-muted-foreground">Only renders visible rows for maximum performance</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 className="h-3 w-3 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">Smart Memoization</div>
                    <div className="text-sm text-muted-foreground">Minimizes re-renders with optimized memo comparisons</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="h-3 w-3 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-medium">Zero Dependencies</div>
                    <div className="text-sm text-muted-foreground">No external runtime dependencies for minimal bundle size</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
              <div className="relative bg-card rounded-xl border p-6 font-mono text-sm">
                <div className="text-muted-foreground mb-4">// Easy to use</div>
                <div className="space-y-2">
                  <div><span className="text-blue-400">import</span> {'{'} DataGrid {'}'} <span className="text-blue-400">from</span> <span className="text-green-400">'@/components/DataGrid'</span>;</div>
                  <div className="mt-4"><span className="text-purple-400">{'<DataGrid'}</span></div>
                  <div className="pl-4"><span className="text-yellow-400">rowData</span>={'{data}'}</div>
                  <div className="pl-4"><span className="text-yellow-400">columnDefs</span>={'{columns}'}</div>
                  <div className="pl-4"><span className="text-yellow-400">rowSelection</span>=<span className="text-green-400">"multiple"</span></div>
                  <div className="pl-4"><span className="text-yellow-400">pagination</span></div>
                  <div className="pl-4"><span className="text-yellow-400">height</span>={'{600}'}</div>
                  <div><span className="text-purple-400">{'/>'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-background to-accent/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start building powerful data-driven applications today with LovGrid.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/demo">
                Try the Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/docs">Read the Docs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Table2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">LovGrid</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with ❤️ using React, TypeScript, and Tailwind CSS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}