import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Eye } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface ExampleBlockProps {
    title: string;
    description?: string;
    code: string;
    preview: React.ReactNode;
    previewHeight?: number;
}

export const ExampleBlock = ({ title, description, code, preview, previewHeight = 300 }: ExampleBlockProps) => {
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
