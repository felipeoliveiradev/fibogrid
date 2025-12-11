import { FiboGrid, ColumnDef } from 'fibogrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Palette, Check } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { useState, useMemo } from 'react';

const sampleData = [
    { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active', price: 1500, profit: 500, category: 'Art' },
    { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active', price: 2200, profit: -200, category: 'Sculpture' },
    { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending', price: 1800, profit: 0, category: 'Art' },
];

const statusColumns: ColumnDef<any>[] = [
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'email', headerName: 'Email', width: 180 },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        cellRenderer: ({ value }: { value: string }) => {
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
];

export const Styling = ({ activeSection }: { activeSection: string }) => {
    const [themingGridTheme, setThemingGridTheme] = useState('theme-default');

    return (
        <>
            {activeSection === 'styling-validation' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Styling & Validation</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Dynamic Row Styling</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-body text-muted-foreground mb-4">
                                Use <code>getRowClass</code> to apply CSS classes to rows based on data logic.
                            </p>
                            <CodeBlock code={`<FiboGrid
  rowData={data}
  columnDefs={columns}
  getRowClass={(params) => {
    // Apply different background for high value items
    if (params.data.price > 2000) {
      return 'bg-green-500/10 dark:bg-green-900/20';
    }
    // Apply styling for pending status
    if (params.data.status === 'Pending') {
      return 'opacity-75 italic';
    }
    return undefined; // No class
  }}
/>`} />
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Dynamic Cell Styling</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-body text-muted-foreground mb-4">
                                Use <code>cellClass</code> in column definitions to style individual cells.
                            </p>
                            <CodeBlock code={`const columns: ColumnDef[] = [
  {
    field: 'profit',
    headerName: 'Profit',
    // Dynamic cell class
    cellClass: (params) => {
      if (params.value > 0) return 'text-green-600 font-medium';
      if (params.value < 0) return 'text-red-600 font-medium';
      return 'text-muted-foreground';
    }
  }
];`} />
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center gap-2">
                                <Check className="h-5 w-5 text-primary" />
                                Cell Validation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-body text-muted-foreground mb-4">
                                Use <code>valueSetter</code> to validate edits before they are committed. Return <code>true</code> to accept the change, or <code>false</code> to reject it.
                            </p>
                            <CodeBlock code={`const columns: ColumnDef[] = [
  {
    field: 'price',
    headerName: 'Price',
    editable: true,
    valueSetter: (params) => {
      const { newValue, oldValue, data } = params;
      
      // Validation: Price cannot be negative
      if (newValue < 0) {
        toast.error('Price cannot be negative!');
        return false; // Reject change
      }
      
      // Validation: Price change cap (e.g. max 50% change)
      if (Math.abs(newValue - oldValue) / oldValue > 0.5) {
         if (!confirm('Large price change detected. Are you sure?')) {
             return false;
         }
      }

      // If valid, update data
      data.price = newValue;
      return true; // Commit change
    }
  }
];`} />
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
                                Isolated CSS Variables System
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="font-body text-muted-foreground">
                                FiboGrid uses an isolated CSS Variables system that won't conflict with your application's styles. All variables are prefixed with <code className="px-2 py-1 bg-primary/10 rounded text-sm font-mono">--fibogrid-*</code> and scoped under the <code className="px-2 py-1 bg-primary/10 rounded text-sm font-mono">.fibogrid</code> class.
                            </p>
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                <p className="font-body text-sm">
                                    <strong className="text-primary">✅ Zero conflicts</strong> - Won't affect your app's styles<br />
                                    <strong className="text-primary">✅ Easy customization</strong> - Override just what you need<br />
                                    <strong className="text-primary">✅ Predictable</strong> - All variables have <code className="px-1 bg-primary/10 rounded text-xs">--fibogrid-*</code> prefix
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Quick Start</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CodeBlock code={`import { FiboGrid } from 'fibogrid';
import 'fibogrid/styles.css';

// The grid automatically gets the .fibogrid class
<FiboGrid rowData={data} columnDefs={columns} />`} />
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center justify-between">
                                <span>Interactive Theme Preview</span>
                                <ThemeSelector value={themingGridTheme} onThemeChange={setThemingGridTheme} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="font-body text-sm text-muted-foreground">
                                Try different pre-built themes in real-time. Notice how the grid theme changes independently from the documentation site's theme.
                            </p>
                            <div className="border border-primary/10 rounded-lg overflow-hidden" style={{ height: 400 }}>
                                <FiboGrid
                                    className={themingGridTheme === 'theme-default' ? '' : themingGridTheme}
                                    rowData={sampleData}
                                    columnDefs={statusColumns}
                                    getRowId={(row) => row.id}
                                    rowSelection="multiple"
                                    showToolbar={true}
                                    showStatusBar={true}
                                />
                            </div>
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                <p className="font-body text-sm">
                                    <strong className="text-primary">💡 Notice:</strong> Changing the grid theme above doesn't affect the documentation site's appearance. The grid has its own isolated theming system!
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Available CSS Variables</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="colors" className="w-full">
                                <TabsList className="bg-primary/5 border border-primary/10">
                                    <TabsTrigger value="colors">Colors</TabsTrigger>
                                    <TabsTrigger value="sizing">Sizing</TabsTrigger>
                                    <TabsTrigger value="typography">Typography</TabsTrigger>
                                    <TabsTrigger value="spacing">Spacing</TabsTrigger>
                                </TabsList>
                                <TabsContent value="colors" className="mt-4 space-y-4">
                                    <div>
                                        <h4 className="font-display font-semibold mb-2">Background & Surface</h4>
                                        <CodeBlock code={`--fibogrid-bg: #ffffff;
--fibogrid-surface: #fafafa;
--fibogrid-surface-hover: #f5f5f5;
--fibogrid-surface-selected: #e8f4fd;`} language="css" />
                                    </div>
                                    <div>
                                        <h4 className="font-display font-semibold mb-2">Text Colors</h4>
                                        <CodeBlock code={`--fibogrid-text: #1a1a1a;
--fibogrid-text-secondary: #666666;
--fibogrid-text-muted: #999999;
--fibogrid-text-inverse: #ffffff;`} language="css" />
                                    </div>
                                    <div>
                                        <h4 className="font-display font-semibold mb-2">Primary (Gold)</h4>
                                        <CodeBlock code={`--fibogrid-primary: hsl(40, 65%, 45%);
--fibogrid-primary-hover: hsl(42, 70%, 50%);
--fibogrid-primary-active: hsl(38, 60%, 40%);
--fibogrid-primary-text: #ffffff;`} language="css" />
                                    </div>
                                    <div>
                                        <h4 className="font-display font-semibold mb-2">State Colors</h4>
                                        <CodeBlock code={`--fibogrid-success: #22c55e;
--fibogrid-warning: #f59e0b;
--fibogrid-error: #ef4444;
--fibogrid-info: #3b82f6;`} language="css" />
                                    </div>
                                </TabsContent>
                                <TabsContent value="sizing" className="mt-4">
                                    <CodeBlock code={`--fibogrid-header-height: 44px;
--fibogrid-row-height: 40px;
--fibogrid-toolbar-height: 48px;
--fibogrid-statusbar-height: 36px;
--fibogrid-cell-padding: 12px;`} language="css" />
                                </TabsContent>
                                <TabsContent value="typography" className="mt-4">
                                    <CodeBlock code={`--fibogrid-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
--fibogrid-font-size: 14px;
--fibogrid-font-size-sm: 12px;
--fibogrid-font-size-lg: 16px;
--fibogrid-font-weight-normal: 400;
--fibogrid-font-weight-medium: 500;
--fibogrid-font-weight-semibold: 600;
--fibogrid-font-weight-bold: 700;
--fibogrid-line-height: 1.5;`} language="css" />
                                </TabsContent>
                                <TabsContent value="spacing" className="mt-4">
                                    <CodeBlock code={`--fibogrid-spacing-xs: 4px;
--fibogrid-spacing-sm: 8px;
--fibogrid-spacing-md: 12px;
--fibogrid-spacing-lg: 16px;
--fibogrid-spacing-xl: 24px;

--fibogrid-radius-sm: 4px;
--fibogrid-radius-md: 6px;
--fibogrid-radius-lg: 8px;`} language="css" />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};
