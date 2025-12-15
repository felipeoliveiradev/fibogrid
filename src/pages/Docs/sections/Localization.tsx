import { FiboGrid } from 'fibogrid';
import { enUS } from '@/components/FiboGrid/locales/enUS';
import { ptBR } from '@/components/FiboGrid/locales/ptBR';
import { ExampleBlock } from '../components/ExampleBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '../components/CodeBlock';

const sampleData = [
    { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active' },
    { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active' },
    { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending' },
];

const columns = [
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'email', headerName: 'Email' },
    { field: 'status', headerName: 'Status', width: 100 },
];

export const Localization = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Localization</h1>

            <p className="text-lg text-muted-foreground font-body">
                FiboGrid allows you to easily localize the interface by passing a locale object to the <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">lang</code> prop.
                We provide built-in locales for English (US) and Portuguese (BR), but you can create your own custom locale.
            </p>

            <ExampleBlock
                title="Switching Locales"
                description="Pass the locale object to the grid. In this example, we use the Portuguese (BR) locale."
                code={`import { FiboGrid } from 'fibogrid';
import { ptBR } from 'fibogrid/locales'; 

<FiboGrid
  rowData={data}
  columnDefs={columns}
  lang={ptBR} 
/>`}
                preview={
                    <FiboGrid
                        rowData={sampleData}
                        columnDefs={columns}
                        getRowId={(row) => row.id}
                        lang={ptBR}
                        showToolbar={true}
                        showStatusBar={true}
                        pagination={true}
                    />
                }
            />

            <Card className="paper-aged border-primary/10">
                <CardHeader>
                    <CardTitle className="font-display text-xl">Custom Locale</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-body text-muted-foreground mb-4">
                        You can create a custom locale by implementing the <code className="text-primary font-mono">FiboGridLocale</code> interface.
                        This allows you to translate every label, tooltip, and message in the grid.
                    </p>
                    <CodeBlock code={`import { FiboGridLocale } from 'fibogrid/types';

const myCustomLocale: FiboGridLocale = {
    toolbar: {
        searchPlaceholder: "Search records...",
        columns: "Cols",
        
    },
    
};`} />
                </CardContent>
            </Card>
        </div>
    );
};
