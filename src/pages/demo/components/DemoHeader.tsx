import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Plus, Trash2, RefreshCw, FileSpreadsheet, Play, Pause, ArrowLeft } from 'lucide-react';
import { FiboLogo } from './FiboLogo';

interface DemoHeaderProps {
    isRealTimeEnabled: boolean;
    renderTime: number;
    onToggleRealTime: (value: boolean) => void;
    onAddRow: () => void;
    onDeleteSelected: () => void;
    onExport: () => void;
    onRefresh: () => void;
}

export function DemoHeader({
    isRealTimeEnabled,
    renderTime,
    onToggleRealTime,
    onAddRow,
    onDeleteSelected,
    onExport,
    onRefresh,
}: DemoHeaderProps) {
    return (
        <header className="border-b border-primary/10 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="max-w-[1900px] mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <FiboLogo className="h-8 w-8" />
                            <span className="font-display font-bold text-xl">FiboGrid</span>
                            <Badge className="bg-primary/10 text-primary border-primary/30 font-body text-xs px-2 py-0.5">Beta</Badge>
                        </Link>
                        <Badge className="bg-primary/10 text-primary border-primary/30 font-body">Interactive Demo</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-primary/10">
                            {isRealTimeEnabled ? (
                                <Pause className="h-4 w-4 text-destructive" />
                            ) : (
                                <Play className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-sm font-body">Real-time</span>
                            <Switch checked={isRealTimeEnabled} onCheckedChange={onToggleRealTime} />
                        </div>
                        {isRealTimeEnabled && (
                            <Badge variant="outline" className="font-mono border-primary/30">
                                {renderTime}ms render
                            </Badge>
                        )}
                        <ThemeToggle />
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" onClick={onAddRow}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                            <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" onClick={onDeleteSelected}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                            <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" onClick={onExport}>
                                <FileSpreadsheet className="h-4 w-4 mr-1" />
                                Excel
                            </Button>
                            <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" onClick={onRefresh}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

