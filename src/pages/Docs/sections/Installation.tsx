import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Installation = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Installation</h1>
                <p className="text-lg text-muted-foreground">
                    Get started with FiboGrid in your React application in seconds.
                </p>
            </div>

            {/* Install Command */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">1. Install Package</h2>
                <Tabs defaultValue="npm" className="w-full">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="npm">npm</TabsTrigger>
                        <TabsTrigger value="yarn">yarn</TabsTrigger>
                        <TabsTrigger value="pnpm">pnpm</TabsTrigger>
                        <TabsTrigger value="bun">bun</TabsTrigger>
                    </TabsList>
                    <div className="mt-4">
                        <TabsContent value="npm">
                            <CodeBlock code="npm install fibogrid" language="bash" />
                        </TabsContent>
                        <TabsContent value="yarn">
                            <CodeBlock code="yarn add fibogrid" language="bash" />
                        </TabsContent>
                        <TabsContent value="pnpm">
                            <CodeBlock code="pnpm add fibogrid" language="bash" />
                        </TabsContent>
                        <TabsContent value="bun">
                            <CodeBlock code="bun add fibogrid" language="bash" />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Peer Dependencies */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">2. Peer Dependencies</h2>
                <p className="text-muted-foreground">
                    FiboGrid relies on the following packages. Ensure they are installed in your project:
                </p>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="pt-6">
                        <ul className="space-y-3 font-mono text-sm">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>react {'>='} 18.0.0</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>react-dom {'>='} 18.0.0</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>tailwindcss {'>='} 3.0.0</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Styles */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">3. Import Styles</h2>
                <p className="text-muted-foreground">
                    Import the core CSS file in your root component (e.g., <code className="text-primary">main.tsx</code> or <code className="text-primary">App.tsx</code>):
                </p>
                <CodeBlock
                    code={`// In your main entry file
import 'fibogrid/styles/index.css';`}
                    language="typescript"
                />
            </div>

            {/* Tailwind Config */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">4. Configure Tailwind</h2>
                <Alert className="bg-blue-500/5 border-blue-500/20 text-blue-500">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Optional but Recommended</AlertTitle>
                    <AlertDescription>
                        FiboGrid works out of the box, but if you want to customize themes using your Tailwind config, ensure your content paths include the library.
                    </AlertDescription>
                </Alert>
                <CodeBlock
                    code={`// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // Add this line to scan FiboGrid classes
    "./node_modules/fibogrid/**/*.{js,jsx,ts,tsx}" 
  ],
  // ...
}`}
                    language="javascript"
                />
            </div>
        </div>
    );
};
