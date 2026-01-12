import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
    code: string;
    language?: string;
    showLineNumbers?: boolean;
    className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
    code,
    language = 'typescript',
    showLineNumbers = false,
    className
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("relative group rounded-lg border border-primary/10 bg-muted/30 overflow-hidden my-4", className)}>
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-primary/5">
                <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground">{language}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={handleCopy}
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                    {showLineNumbers ? (
                        <code className="grid">
                            {code.split('\n').map((line, i) => (
                                <div key={i} className="table-row">
                                    <span className="table-cell select-none text-muted-foreground/30 text-right pr-4 w-8">{i + 1}</span>
                                    <span className="table-cell">{line || ' '}</span>
                                </div>
                            ))}
                        </code>
                    ) : (
                        <code>{code}</code>
                    )}
                </pre>
            </div>
        </div>
    );
};
