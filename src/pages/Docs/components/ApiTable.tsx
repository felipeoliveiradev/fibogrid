import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ApiItem {
    name: string;
    type: string;
    default?: string;
    description: React.ReactNode;
    required?: boolean;
}

interface ApiTableProps {
    items: ApiItem[];
}

export const ApiTable: React.FC<ApiTableProps> = ({ items }) => {
    return (
        <div className="border border-primary/10 rounded-lg overflow-hidden my-6">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground font-medium text-left">
                    <tr>
                        <th className="px-4 py-3 w-1/4">Prop</th>
                        <th className="px-4 py-3 w-1/4">Type</th>
                        <th className="px-4 py-3 w-1/6">Default</th>
                        <th className="px-4 py-3">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-primary/5 bg-card/30">
                    {items.map((item) => (
                        <tr key={item.name} className="hover:bg-primary/5 transition-colors">
                            <td className="px-4 py-3 font-mono text-primary flex items-center gap-2">
                                {item.name}
                                {item.required && (
                                    <Badge variant="destructive" className="h-4 px-1 text-[10px] tracking-tight">REQ</Badge>
                                )}
                            </td>
                            <td className="px-4 py-3 font-mono text-muted-foreground text-xs break-all">
                                {item.type}
                            </td>
                            <td className="px-4 py-3 font-mono text-muted-foreground text-xs">
                                {item.default || '-'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground leading-relaxed">
                                {item.description}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
