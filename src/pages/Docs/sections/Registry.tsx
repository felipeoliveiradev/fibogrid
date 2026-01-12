import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Network, Link2 } from 'lucide-react';

export const Registry = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Grid Registry</h1>
                <p className="text-lg text-muted-foreground">
                    The central nervous system that allows grids to communicate with each other.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    Setup
                </h2>
                <p className="text-muted-foreground">
                    Wrap your application (or the section containing grids) with the provider.
                </p>
                <CodeBlock code={`import { GridRegistryProvider } from 'fibogrid';

function App() {
  return (
    <GridRegistryProvider>
       <MasterDetailView />
    </GridRegistryProvider>
  );
}`} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    Linking Grids (Master-Detail)
                </h2>
                <p className="text-muted-foreground">
                    Use <code className="text-primary">useFiboGrid</code> or <code className="text-primary">useGridRegistry</code> to control one grid from another.
                </p>

                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="p-0">
                        <CodeBlock
                            code={`// Master Grid Component
const MasterGrid = () => {
   const { getGridApi } = useGridRegistry();

   return (
     <FiboGrid
       gridId="master"
       onRowSelected={(event) => {
          if (!event.selected) return;
          
          // Get Detail Grid API
          const detailApi = getGridApi('detail');
          
          if (detailApi) {
             // Filter detail grid to show orders for selected customer
             detailApi.setFilterModel([{
                field: 'customerId',
                type: 'equals',
                value: event.data.id
             }]);
          }
       }}
     />
   );
}`}
                            className="border-none m-0 rounded-none bg-transparent"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
