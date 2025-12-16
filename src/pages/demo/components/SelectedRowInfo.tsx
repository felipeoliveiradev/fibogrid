import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGridSelection } from 'fibogrid';
import { Info } from 'lucide-react';

interface SelectedRowInfoProps {
    gridId: string;
    // lastUpdate is no longer needed!
    lastUpdate?: number;
}

export function SelectedRowInfo({ gridId }: SelectedRowInfoProps) {
    const selectedRows = useGridSelection(gridId);
    console.log(selectedRows);
    const selectedData = selectedRows.length > 0 ? selectedRows[0] : null;

    if (!selectedData) {
        return null;
    }

    const displayEntries = Object.entries(selectedData).filter(([_, value]) => {
        return typeof value !== 'object' || value === null;
    });

    return (
        <Card className="paper-aged border-primary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                <CardTitle className="text-sm flex items-center gap-2 font-display text-primary">
                    <Info className="h-4 w-4" />
                    Selected Row Details
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
                <div className="text-xs font-dm-mono">
                    <table className="w-full">
                        <tbody>
                            {displayEntries.map(([key, value]) => (
                                <tr key={key} className="border-b border-primary/5 last:border-0 hover:bg-primary/5 transition-colors">
                                    <td className="py-1.5 pr-2 font-semibold text-muted-foreground capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </td>
                                    <td className="py-1.5 text-right font-medium text-foreground truncate max-w-[120px]">
                                        {String(value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
