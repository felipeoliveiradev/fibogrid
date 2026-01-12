import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { CodeBlock } from './CodeBlock';
import { Eye, Code2 } from 'lucide-react';

interface ExampleBlockProps {
    title?: string;
    description?: string;
    code: string;
    preview: React.ReactNode;
}

export const ExampleBlock: React.FC<ExampleBlockProps> = ({
    title,
    description,
    code,
    preview
}) => {
    return (
        <div className="space-y-4 my-8">
            {(title || description) && (
                <div className="space-y-1">
                    {title && <h3 className="text-lg font-display font-semibold">{title}</h3>}
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            )}

            <Card className="border-primary/10 overflow-hidden bg-card/50">
                <Tabs defaultValue="preview" className="w-full">
                    <div className="border-b border-primary/5 bg-muted/30 px-4">
                        <TabsList className="h-10 bg-transparent p-0">
                            <TabsTrigger
                                value="preview"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-4 gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                Preview
                            </TabsTrigger>
                            <TabsTrigger
                                value="code"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-4 gap-2"
                            >
                                <Code2 className="h-4 w-4" />
                                Code
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="preview" className="p-6 m-0 min-h-[200px] flex flex-col justify-center">
                        <div className="w-full relative z-0">
                            {preview}
                        </div>
                    </TabsContent>

                    <TabsContent value="code" className="m-0">
                        <CodeBlock code={code} className="border-none rounded-none m-0 bg-transparent" />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
};
