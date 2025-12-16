import { enUS } from '@/components/FiboGrid/locales/enUS';
import { FiboGridConfigs } from '@/components/FiboGrid/types';
import { toast } from '@/hooks/use-toast';
import { CellValueChangedEvent, GridApi, RowClickedEvent, RowNode } from 'fibogrid';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DemoGrid } from './components/DemoGrid';
import { DemoHeader } from './components/DemoHeader';
import { DemoSettings } from './components/DemoSettings';
import { generateStockData } from './data/mock';
import { StockRow } from './data/types';
import { useDemoColumns } from './hooks/useDemoColumns';
import { GridRegistryProvider } from 'fibogrid';
import { LinkedGrids } from './components/LinkedGrids';
import { CustomLayoutDemo } from './components/CustomLayoutDemo';
import { ZIndexDemo } from './components/ZIndexDemo';

export default function Demo() {
    const [rowCount, setRowCount] = useState(1000);
    const [rowData, setRowData] = useState<StockRow[]>(() => generateStockData(1000));
    const [gridApi, setGridApi] = useState<GridApi<StockRow> | null>(null);
    const [groupByField, setGroupByField] = useState<string | undefined>(undefined);
    const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
    const [showRowNumbers, setShowRowNumbers] = useState(true);
    const [updateInterval, setUpdateInterval] = useState(100);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [renderTime, setRenderTime] = useState(0);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [useServerSide, setUseServerSide] = useState(false);
    const [localeKey, setLocaleKey] = useState<'en' | 'pt'>('en');
    const [lastRowClickTime, setLastRowClickTime] = useState(0);
    const GRID_ID = 'demo-stocks-grid';


    const currentLocale = enUS;
    const handleSplitRow = useCallback((rowId: string) => {
        setRowData(prev => {
            const idx = prev.findIndex(r => r.id === rowId);
            if (idx === -1) return prev;
            const parent = prev[idx];
            const childId = `${rowId}-child-${Date.now()}`;
            const child: StockRow = { ...parent, id: childId, ticker: '', name: '', parentId: rowId, isChild: true };
            const copy = [...prev];
            copy.splice(idx + 1, 0, child);
            setExpandedRows(p => new Set([...p, rowId]));
            return copy;
        });
    }, []);
    const toggleRowExpand = useCallback((rowId: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(rowId)) next.delete(rowId); else next.add(rowId);
            return next;
        });
    }, []);
    const visibleRowData = useMemo(() => {
        const result: StockRow[] = [];
        const children = new Map<string, StockRow[]>();
        rowData.forEach(row => {
            if (row.parentId && row.isChild) {
                const list = children.get(row.parentId) || [];
                list.push(row);
                children.set(row.parentId, list);
            }
        });
        rowData.forEach(row => {
            if (!row.parentId && !row.isDetailRow) {
                result.push(row);
                if (expandedRows.has(row.id)) {
                    result.push({ ...row, id: `${row.id}-detail`, isDetailRow: true, parentId: row.id });
                    const kids = children.get(row.id);
                    if (kids) kids.forEach(c => result.push(c));
                }
            }
        });
        return result;
    }, [rowData, expandedRows]);
    const hasChildren = useCallback((rowId: string) => rowData.some(r => r.parentId === rowId), [rowData]);
    const { columns } = useDemoColumns({ expandedRows, toggleRowExpand, handleSplitRow, hasChildren });
    const getRowId = useCallback((row: StockRow) => {
        if ('id' in row) return row.id || `stock-${Date.now()}-${Math.random()}`;
        return `stock-unknown-${Math.random()}`;
    }, []);
    useEffect(() => {
        if (isRealTimeEnabled) {
            intervalRef.current = setInterval(() => {
                const start = performance.now();
                startTransition(() => {
                    setRowData(prev => prev.map(stock => {
                        const rand = Math.random();
                        const diff = (rand - 0.5) * 2;
                        const price = stock.price + diff;
                        const change = stock.change + diff;
                        return {
                            ...stock,
                            price: ((price * 100) | 0) / 100,
                            change: ((change * 100) | 0) / 100,
                            changePercent: ((change / price * 10000) | 0) / 100,
                            volume: stock.volume + ((rand * 10000) | 0),
                        };
                    }));
                });
                setRenderTime((performance.now() - start) | 0);
            }, updateInterval);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRealTimeEnabled, updateInterval]);
    const handleRowCountChange = useCallback((count: number) => {
        setRowCount(count);
        if (count >= 50000) {
            toast({ title: 'Generating data...', description: `Creating ${count.toLocaleString()} rows` });
            requestAnimationFrame(() => {
                const start = performance.now();
                const data = generateStockData(count);
                const elapsed = Math.round(performance.now() - start);
                setRowData(data);
                toast({ title: 'Data ready', description: `${count.toLocaleString()} rows in ${elapsed}ms` });
            });
        } else {
            setRowData(generateStockData(count));
        }
    }, []);
    const handleAddRow = useCallback(() => {
        const s: StockRow = { id: `stock-${Date.now()}`, ticker: 'NEW', name: 'New Company', price: 100, change: 0, changePercent: 0, volume: 1000000, marketCap: 50, sector: 'Technology', carro: { cor: 'vermelho' }, pe: 25 };
        if (gridApi) {
            gridApi.manager().add([s]).execute();
            toast({ title: 'Added via Manager API', description: 'Row added using gridApi.manager().add()' });
        } else {
            setRowData(prev => [s, ...prev]);
        }
    }, [gridApi]);

    const handleDeleteSelected = useCallback(() => {
        if (!gridApi) return;
        const selected = gridApi.getSelectedRows();
        if (!selected.length) {
            toast({ title: 'No Selection', variant: 'destructive' });
            return;
        }
        const ids = selected.map((r: RowNode<StockRow>) => r.data.id);
        gridApi.manager().remove(ids).execute();
        toast({ title: 'Deleted via Manager API', description: `${ids.length} row(s) removed using gridApi.manager().remove().` });
    }, [gridApi]);
    const handleExport = useCallback(async () => {
        if (!gridApi) return;
        try {
            const { exportToExcel } = await import('@/components/FiboGrid/utils/excelExport');
            const displayedRows = gridApi.getDisplayedRows();
            const processedColumns = columns.map((col, idx) => ({ ...col, computedWidth: col.width || 100, left: 0, index: idx }));
            exportToExcel(displayedRows, processedColumns, { fileName: 'stocks.xlsx' });
            toast({ title: 'Export Complete' });
        } catch {
            toast({ title: 'Export Failed', variant: 'destructive' });
        }
    }, [gridApi, columns]);
    const handleRefresh = useCallback(() => {
        setRowData(generateStockData(rowCount));
        toast({ title: 'Data Refreshed' });
    }, [rowCount]);
    const onValueChangeStock = useCallback((event: CellValueChangedEvent<StockRow>) => {
        if (gridApi) {
            gridApi.manager().updateCell(event.rowNode.id, event.column.field, event.newValue).execute();
            toast({ title: "Value Updated", description: `Updated ${event.column.headerName} to ${event.newValue}` });
        }
    }, [gridApi]);

    const handleUpAddTest = useCallback(() => {
        if (!gridApi) return;

        const existing = gridApi.getRowData()[0];
        const updateRow: StockRow = {
            ...existing,
            ticker: existing.ticker + '-UPD',
            name: existing.name + ' (Updated)',
            price: existing.price + 10,
        };

        const newRow: StockRow = {
            id: `stock-new-${Date.now()}`,
            ticker: 'UP-ADD',
            name: 'UpAdd Test Row',
            price: 500,
            change: 5,
            changePercent: 1.0,
            volume: 50000,
            marketCap: 100,
            sector: 'Test',
            carro: { cor: 'azul' },
            pe: 15
        };

        gridApi.manager().upAdd([updateRow, newRow]).execute();
        toast({ title: 'upAdd (Mix)', description: 'Updated one existing row (if found) AND added one new row.' });
    }, [gridApi]);

    const handleUpAddUpdateTest = useCallback(() => {
        if (!gridApi) return;
        const rows = gridApi.getDisplayedRows();
        if (rows.length > 0) {
            const rowToUpdate = rows[0].data;
            const updatedRow = { ...rowToUpdate, name: rowToUpdate.name + ' (upAdd Update)', price: rowToUpdate.price + 50 };
            gridApi.manager().upAdd([updatedRow]).execute();
            toast({ title: 'upAdd (Update Only)', description: `Updated row ${rowToUpdate.id} using upAdd()` });
        } else {
            toast({ title: 'upAdd Update Failed', description: 'No rows to update.' });
        }
    }, [gridApi]);

    const handleUpdateTest = useCallback(() => {
        if (!gridApi) return;
        const rows = gridApi.getDisplayedRows();
        if (rows.length > 0) {
            const rowToUpdate = rows[0].data;
            const updatedRow = { ...rowToUpdate, name: rowToUpdate.name + ' (Strict Update)', price: rowToUpdate.price + 100 };
            gridApi.manager().update([updatedRow]).execute();
            toast({ title: 'Update (Strict)', description: `Updated row ${rowToUpdate.id} via manager.update()` });
        } else {
            toast({ title: 'Update Failed', description: 'No rows to update.' });
        }
    }, [gridApi]);

    const handleResetGrid = useCallback(() => {
        if (!gridApi) return;
        gridApi.manager().reset().execute();
        toast({ title: 'Grid Reset', description: 'All data cleared.' });
    }, [gridApi]);

    const handleReplaceAllTest = useCallback(() => {
        if (!gridApi) return;

        const newDataSet: StockRow[] = [];
        for (let i = 0; i < 5; i++) {
            newDataSet.push({
                id: `replace-all-${i}-${Date.now()}`,
                ticker: `REPL-${i}`,
                name: `Replaced Company ${i}`,
                price: 100 + i * 10,
                change: i,
                changePercent: i * 0.1,
                volume: 1000 * i,
                marketCap: 10 * i,
                sector: 'Replaced',
                carro: { cor: 'white' },
                pe: 10
            });
        }

        gridApi.manager().replaceAll(newDataSet).execute();
        toast({ title: 'replaceAll Executed', description: 'Replaced all data with 5 new rows.' });
    }, [gridApi]);

    const handleResetEdits = useCallback(() => {
        if (!gridApi) return;
        gridApi.params().resetEdits().execute();
        toast({ title: 'Reset Edits', description: 'All cell edits have been cleared.' });
    }, [gridApi]);

    const handleResetCellTest = useCallback(() => {
        if (!gridApi) return;
        const visibleRows = gridApi.getDisplayedRows();
        if (visibleRows.length > 0) {
            const rowId = gridApi.getRowData().length > 0 ? gridApi.getRowData()[0].id : null;
            if (rowId) {
                gridApi.manager().resetCell(rowId, 'price').execute();
            } toast({ title: 'Reset Cell Test', description: `Reset 'price' for row ${rowId}` });
        } else {
            toast({ title: 'Reset Cell Test', description: 'No rows to test.' });
        }
    }, [gridApi]);

    const handleResetRowTest = useCallback(() => {
        if (!gridApi) return;
        const visibleRows = gridApi.getDisplayedRows();
        if (visibleRows.length > 0) {
            const rowId = visibleRows[0].id;
            gridApi.manager().resetRow(rowId).execute();
            toast({ title: 'Reset Row Test', description: `Reset all edits for row ${rowId}` });
        } else {
            toast({ title: 'Reset Row Test', description: 'No rows to test.' });
        }
    }, [gridApi]);

    const onRowClickStock = useCallback((event: RowClickedEvent<StockRow> & { clickType?: string | number }) => {
        console.log('Row Clicked:', event, event.api.getSelectedNodes());
        setLastRowClickTime(Date.now()); // Update trigger
        if (event.clickType === 'triple' || event.clickType === 3) {
            toast({ title: 'Triple Click!', description: `You triple-clicked on ${event.rowNode.data.ticker}` });
        } else {
            toast({ title: 'Row Clicked', description: `Clicked on ${event.rowNode.data.ticker} (Type: ${event.clickType})` });
        }
    }, []);
    const [configs, setConfigs] = useState<FiboGridConfigs>({
        header: {
            show: true,
            search: true,
            filterRow: false,
            filterButton: false,
            densityButton: true,
            exportButton: false,
            columnsButton: false,
            copyButton: false,
            refreshButton: false,
            customActions: null,
        },
        center: {
            rowNumbers: true,
            checkboxSelection: true,
            stripes: true,
            borders: true,
        },
        footer: {
            show: true,
            pagination: true,
            information: true,
        },
    });

    const handleConfigChange = useCallback((section: string, key: string, value: boolean) => {
        setConfigs((prev: FiboGridConfigs) => {
            const sectionKey = section as keyof FiboGridConfigs;
            const sectionData = prev[sectionKey] || {};
            return {
                ...prev,
                [section]: {
                    ...sectionData,
                    [key]: value,
                },
            };
        });
    }, []);

    return (
        <GridRegistryProvider>
            <div className="min-h-screen bg-background">
                <DemoHeader
                    isRealTimeEnabled={isRealTimeEnabled}
                    renderTime={renderTime}
                    onToggleRealTime={setIsRealTimeEnabled}
                    onAddRow={handleAddRow}
                    onDeleteSelected={handleDeleteSelected}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                />
                <main className="max-w-[1900px] mx-auto p-6">
                    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                        <DemoSettings
                            configs={configs}
                            onConfigChange={handleConfigChange}
                            rowCount={rowCount}
                            updateInterval={updateInterval}
                            groupByField={groupByField}
                            showRowNumbers={showRowNumbers}
                            useServerSide={useServerSide}
                            onRowCountChange={handleRowCountChange}
                            onUpdateIntervalChange={setUpdateInterval}
                            onGroupByChange={setGroupByField}
                            onShowRowNumbersChange={setShowRowNumbers}
                            onUseServerSideChange={setUseServerSide}
                            totalRows={rowData.length}
                            visibleRows={visibleRowData.length}
                            columnsCount={columns.length}
                            isRealTimeEnabled={isRealTimeEnabled}
                            localeKey={localeKey}
                            onLocaleChange={setLocaleKey}
                            onUpAddTest={handleUpAddTest}
                            onUpAddUpdateTest={handleUpAddUpdateTest}
                            onResetGrid={handleResetGrid}
                            onUpdateTest={handleUpdateTest}
                            onReplaceAllTest={handleReplaceAllTest}
                            onResetEdits={handleResetEdits}
                            onResetCellTest={handleResetCellTest}
                            onResetRowTest={handleResetRowTest}
                            gridId={GRID_ID}
                            lastUpdate={lastRowClickTime}
                        />
                        <DemoGrid
                            gridId={GRID_ID}
                            useServerSide={useServerSide}
                            visibleRowData={visibleRowData}
                            columns={columns}
                            getRowId={getRowId}
                            showRowNumbers={showRowNumbers}
                            groupByField={groupByField}
                            setGridApi={setGridApi}
                            onValueChangeStock={onValueChangeStock}
                            onRowClickStock={onRowClickStock}
                            lang={currentLocale}
                            configs={configs}
                        />
                    </div>
                    <LinkedGrids useServerSide={useServerSide} />
                    <CustomLayoutDemo />
                    <ZIndexDemo />
                </main>
            </div>
        </GridRegistryProvider>
    );
}
