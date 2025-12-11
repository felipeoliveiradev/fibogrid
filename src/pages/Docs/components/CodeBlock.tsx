import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

export const CodeBlock = ({ code, language = 'tsx' }: { code: string; language?: string }) => {
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
                className={`absolute top-2 right-2 h-8 w-8 p-0 transition-all duration-200 ${copied
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
