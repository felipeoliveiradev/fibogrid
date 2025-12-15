import { Badge } from '@/components/ui/badge';
import { FiboGridConfigs } from '@/components/FiboGrid/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Layers, Settings } from 'lucide-react';

interface DemoSettingsProps {
    rowCount: number;
    updateInterval: number;
    groupByField?: string;
    showRowNumbers: boolean;
    useServerSide: boolean;

    onRowCountChange: (count: number) => void;
    onUpdateIntervalChange: (value: number) => void;
    onGroupByChange: (value?: string) => void;
    onShowRowNumbersChange: (value: boolean) => void;
    onUseServerSideChange: (value: boolean) => void;
    totalRows: number;
    visibleRows: number;
    columnsCount: number;
    isRealTimeEnabled: boolean;
    localeKey: 'en' | 'pt';
    onLocaleChange: (key: 'en' | 'pt') => void;
    configs?: FiboGridConfigs;
    onConfigChange?: (section: string, key: string, value: boolean) => void;
    onUpAddTest?: () => void;
    onResetGrid?: () => void;
}

export function DemoSettings(props: DemoSettingsProps) {
    const rowOptions = [100, 1000, 10000, 20000, 100000];
    const renderConfigSwitch = (section: string, key: string, label: string) => (
        <div className="flex items-center justify-between text-xs font-body">
            <span className="text-muted-foreground">{label}</span>
            <Switch
                checked={props.configs?.[section]?.[key] ?? true}
                onCheckedChange={(checked) => props.onConfigChange?.(section, key, checked)}
                className="scale-90"
            />
        </div>
    );

    return (
        <div className="space-y-4">
            <Card className="paper-aged border-primary/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 font-display">
                        <Settings className="h-4 w-4 text-primary" />
                        Visual Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Header</h4>
                        <div className="space-y-2 pl-2 border-l border-primary/10">
                            {renderConfigSwitch('header', 'show', 'Show Header')}
                            {props.configs?.header?.show && (
                                <>
                                    {renderConfigSwitch('header', 'search', 'Search Bar')}
                                    {renderConfigSwitch('header', 'filterRow', 'Filter Row')}
                                    {renderConfigSwitch('header', 'filterButton', 'Filter Tags')}
                                    {renderConfigSwitch('header', 'columnsButton', 'Columns Button')}
                                    {renderConfigSwitch('header', 'copyButton', 'Copy Button')}
                                    {renderConfigSwitch('header', 'exportButton', 'Export Button')}
                                    {renderConfigSwitch('header', 'refreshButton', 'Refresh Button')}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Body</h4>
                        <div className="space-y-2 pl-2 border-l border-primary/10">
                            {renderConfigSwitch('center', 'rowNumbers', 'Row Numbers')}
                            {renderConfigSwitch('center', 'checkboxSelection', 'Checkbox Selection')}
                            {renderConfigSwitch('center', 'stripes', 'Striped Rows')}
                            {renderConfigSwitch('center', 'borders', 'Borders')}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Footer</h4>
                        <div className="space-y-2 pl-2 border-l border-primary/10">
                            {renderConfigSwitch('footer', 'show', 'Show Footer')}
                            {props.configs?.footer?.show && (
                                <>
                                    {renderConfigSwitch('footer', 'pagination', 'Pagination Controls')}
                                    {renderConfigSwitch('footer', 'information', 'Status Info')}
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="paper-aged border-primary/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 font-display">
                        <Settings className="h-4 w-4 text-primary" />
                        Data Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-body">
                            <span>Row Count</span>
                            <Badge variant="outline" className="border-primary/30 font-mono">{props.rowCount.toLocaleString()}</Badge>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {rowOptions.map((count) => (
                                <Button
                                    key={count}
                                    size="sm"
                                    variant={props.rowCount === count ? "default" : "outline"}
                                    className={props.rowCount === count ? "bg-gradient-gold text-primary-foreground shadow-gold" : "border-primary/30 hover:border-primary font-body"}
                                    onClick={() => props.onRowCountChange(count)}
                                >
                                    {count >= 1000 ? `${count / 1000}k` : count}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {/* ... other settings ... */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-body">
                            <span>Update Interval</span>
                            <Badge variant="outline" className="border-primary/30 font-mono">{props.updateInterval}ms</Badge>
                        </div>
                        <Slider
                            value={[props.updateInterval]}
                            onValueChange={([v]) => props.onUpdateIntervalChange(v)}
                            min={50}
                            max={1000}
                            step={50}
                            className="[&_[role=slider]]:bg-gradient-gold [&_[role=slider]]:border-primary"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-body">Server-side Pagination</span>
                        <Switch checked={props.useServerSide} onCheckedChange={props.onUseServerSideChange} />
                    </div>
                </CardContent>
            </Card>

            <Card className="paper-aged border-primary/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 font-display">
                        <Layers className="h-4 w-4 text-primary" />
                        Manager API
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={props.onUpAddTest} className="w-full border-primary/30 hover:border-primary font-body">
                            Test upAdd
                        </Button>
                        <Button variant="outline" size="sm" onClick={props.onResetGrid} className="w-full border-primary/30 hover:border-primary font-body">
                            Reset Grid
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="paper-aged border-primary/10">
                <CardContent className="pt-6">
                    <div className="space-y-2 text-sm font-body">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Rows</span>
                            <span className="font-semibold font-mono">{props.totalRows.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Visible</span>
                            <span className="font-semibold font-mono">{props.visibleRows.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Columns</span>
                            <span className="font-semibold font-mono">{props.columnsCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Real-time</span>
                            <span className={`font-semibold ${props.isRealTimeEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                                {props.isRealTimeEnabled ? 'Active' : 'Paused'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

