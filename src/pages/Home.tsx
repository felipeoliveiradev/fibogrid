import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@/components/DataGrid';
import { ColumnDef, GridApi } from '@/components/DataGrid/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Zap, 
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
  BarChart3,
  Clock,
  Shield,
  Hexagon
} from 'lucide-react';

// FiboGrid Logo Component
const FiboLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Golden spiral based on Fibonacci */}
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(42 70% 55%)" />
        <stop offset="50%" stopColor="hsl(40 65% 45%)" />
        <stop offset="100%" stopColor="hsl(38 60% 35%)" />
      </linearGradient>
    </defs>
    {/* Fibonacci spiral squares */}
    <rect x="10" y="10" width="34" height="34" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="2"/>
    <rect x="44" y="10" width="21" height="21" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
    <rect x="44" y="31" width="13" height="13" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
    <rect x="57" y="31" width="8" height="8" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
    <rect x="57" y="39" width="5" height="5" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="0.5"/>
    {/* Grid representation */}
    <rect x="10" y="50" width="55" height="40" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="3"/>
    <line x1="10" y1="60" x2="65" y2="60" stroke="url(#goldGradient)" strokeWidth="1.5"/>
    <line x1="10" y1="70" x2="65" y2="70" stroke="url(#goldGradient)" strokeWidth="1"/>
    <line x1="10" y1="80" x2="65" y2="80" stroke="url(#goldGradient)" strokeWidth="1"/>
    <line x1="30" y1="50" x2="30" y2="90" stroke="url(#goldGradient)" strokeWidth="1"/>
    <line x1="50" y1="50" x2="50" y2="90" stroke="url(#goldGradient)" strokeWidth="1"/>
    {/* Golden circle accent */}
    <circle cx="80" cy="70" r="12" stroke="url(#goldGradient)" strokeWidth="2" fill="none"/>
    <circle cx="80" cy="70" r="7" stroke="url(#goldGradient)" strokeWidth="1.5" fill="hsl(40 65% 45% / 0.2)"/>
  </svg>
);

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
  { value: 'φ', label: 'Golden Ratio' },
];

export default function Home() {
  const [demoData] = useState(() => generateDemoData(50));
  const [, setGridApi] = useState<GridApi<any> | null>(null);

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
          'In Stock': 'bg-green-600/20 text-green-700 dark:text-green-400',
          'Low Stock': 'bg-amber-600/20 text-amber-700 dark:text-amber-400',
          'Out of Stock': 'bg-red-600/20 text-red-700 dark:text-red-400',
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
        <span className="text-primary">★ {params.value}</span>
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
    <div className="min-h-screen bg-background relative">
      {/* Texture overlay for parchment effect */}
      <div className="fixed inset-0 texture-overlay pointer-events-none" />
      
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background - Da Vinci inspired */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 grid-fibonacci opacity-30" />
        
        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiboLogo className="h-10 w-10" />
            <span className="text-2xl font-display font-bold tracking-tight">FiboGrid</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors font-body">
              Docs
            </Link>
            <Link to="/demo" className="text-muted-foreground hover:text-foreground transition-colors font-body">
              Demo
            </Link>
            <ThemeToggle />
            <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5" asChild>
              <a href="https://github.com" target="_blank" rel="noopener">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary border-primary/30 font-body">
              <Hexagon className="h-3 w-3 mr-2" />
              The Renaissance of Data Grids
            </Badge>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8 leading-[0.95]">
              <span className="text-gradient-gold">FiboGrid</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-body leading-relaxed">
              A high-performance React data grid inspired by Da Vinci's pursuit of perfection. 
              Handle <span className="text-primary font-semibold">100,000+ rows</span> with mathematical elegance.
            </p>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground shadow-gold hover:shadow-gold-lg transition-shadow font-body" asChild>
                <Link to="/demo">
                  <Play className="h-4 w-4 mr-2" />
                  Experience the Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" asChild>
                <Link to="/docs">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats - Golden ratio inspired */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-body uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Interactive Demo Grid */}
          <div className="relative rounded-xl overflow-hidden border border-primary/20 shadow-parchment glow-gold">
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none z-10" />
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
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-card/50" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Crafted with Precision</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Every feature engineered with the precision of a Renaissance master. 
              No detail overlooked, no performance compromised.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card 
                key={i} 
                className="group paper-aged border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-gold animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-lg bg-gradient-gold flex items-center justify-center mb-5 shadow-gold group-hover:scale-105 transition-transform">
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground font-body">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/30 font-body">
                <Clock className="h-3 w-3 mr-2" />
                Performance
              </Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Built for Scale</h2>
              <p className="text-lg text-muted-foreground mb-10 font-body leading-relaxed">
                Like Da Vinci's flying machines, FiboGrid was designed for what seems impossible. 
                Smooth 60fps scrolling with 100,000+ rows. Real-time updates without breaking a sweat.
              </p>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-gold">
                    <Zap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-lg">Virtual Scrolling</div>
                    <div className="text-sm text-muted-foreground font-body">Only renders visible rows for maximum performance</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-gold">
                    <BarChart3 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-lg">Smart Memoization</div>
                    <div className="text-sm text-muted-foreground font-body">Minimizes re-renders with optimized memo comparisons</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-gold">
                    <Shield className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-lg">Zero Dependencies</div>
                    <div className="text-sm text-muted-foreground font-body">No external runtime dependencies for minimal bundle size</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gold rounded-2xl blur-3xl opacity-20" />
              <div className="relative paper-aged rounded-xl border border-primary/20 p-8 font-mono text-sm shadow-parchment">
                <div className="text-muted-foreground mb-4 font-body italic">// Elegantly simple</div>
                <div className="space-y-2">
                  <div><span className="text-primary">import</span> {'{'} DataGrid {'}'} <span className="text-primary">from</span> <span className="text-accent">'fibogrid'</span>;</div>
                  <div className="mt-6"><span className="text-accent">{'<FiboGrid'}</span></div>
                  <div className="pl-4"><span className="text-primary">rowData</span>={'{data}'}</div>
                  <div className="pl-4"><span className="text-primary">columnDefs</span>={'{columns}'}</div>
                  <div className="pl-4"><span className="text-primary">rowSelection</span>=<span className="text-accent">"multiple"</span></div>
                  <div className="pl-4"><span className="text-primary">pagination</span></div>
                  <div className="pl-4"><span className="text-primary">height</span>={'{600}'}</div>
                  <div><span className="text-accent">{'/>'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 grid-fibonacci opacity-20" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
            Ready to Create Your <span className="text-gradient-gold">Masterpiece</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 font-body max-w-xl mx-auto">
            Join the renaissance of data visualization. Start building with FiboGrid today.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="bg-gradient-gold text-primary-foreground shadow-gold hover:shadow-gold-lg transition-shadow font-body" asChild>
              <Link to="/demo">
                Try the Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" asChild>
              <Link to="/docs">Read the Docs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <FiboLogo className="h-8 w-8" />
              <span className="font-display font-semibold text-xl">FiboGrid</span>
            </div>
            <div className="text-sm text-muted-foreground font-body text-center md:text-right">
              Inspired by Leonardo da Vinci's pursuit of mathematical perfection.
              <br />
              Built with React, TypeScript, and Tailwind CSS.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
