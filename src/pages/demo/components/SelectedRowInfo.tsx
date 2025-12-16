import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGridRegistry, useGridEvent } from '@/components/FiboGrid/context/GridRegistryContext';
import { Info } from 'lucide-react';
import { useEffect, useState, memo, useCallback } from 'react';

interface SelectedRowInfoProps {
    gridId: string;
}

export const SelectedRowInfo = memo(function SelectedRowInfo({ gridId }: SelectedRowInfoProps) {
    const { getGridApi } = useGridRegistry();
    const [selectedData, setSelectedData] = useState<any | null>(null);

    // Helper to update state from API
    const updateFromApi = useCallback((api: any) => {
        const rows = api.getSelectedRows();
        setSelectedData(rows && rows.length > 0 ? rows[0].data : null);
    }, []);

    // Initial check on mount (in case grid is already ready and selected)
    useEffect(() => {
        const api = getGridApi(gridId);
        if (api) updateFromApi(api);
    }, [gridId, getGridApi, updateFromApi]);

    // Subscribe to selection changes
    useGridEvent(gridId, 'selectionChanged', ({ api }) => {
        updateFromApi(api);
    });

    if (!selectedData) {
        return null;
    }

    // Filter out complex objects/arrays for simple display
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
});
