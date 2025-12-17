import { FiboGrid, useGridEvents } from '@/components/FiboGrid';
import { useEffect } from 'react';
import { FiboGridLocale } from '@/components/FiboGrid/locales/types';
import { FiboGridConfigs, ColumnDef, GridApi, CellValueChangedEvent, RowClickedEvent, ServerSideDataSourceRequest, ServerSideDataSourceResponse } from '@/components/FiboGrid/types';
import { Badge } from 'lucide-react';
import { StockRow } from '../data/types';

interface DemoGridProps {
    useServerSide: boolean;
    visibleRowData: StockRow[];
    columns: ColumnDef<StockRow>[];
    getRowId: (row: StockRow) => string;
    showRowNumbers: boolean;
    groupByField?: string;
    serverSideDataSource?: { getRows: (request: ServerSideDataSourceRequest) => Promise<ServerSideDataSourceResponse<StockRow>> };
    setGridApi: (api: GridApi<StockRow> | null) => void;
    onValueChangeStock: (event: CellValueChangedEvent<StockRow>) => void;
    onRowClickStock: (event: RowClickedEvent<StockRow>) => void;
    lang?: FiboGridLocale;
    configs?: FiboGridConfigs;
    gridId?: string;
}

export function DemoGrid(props: DemoGridProps) {
    const columnDefs = props.columns;
    const dataSource = props.serverSideDataSource;
    const onCellValueChanged = props.onValueChangeStock;
    const onRowClickFallback = props.onRowClickStock;
    const pageSize = 25;
    const pageOptions = [25, 50, 100, 250, 500];
    const groupFields = props.groupByField ? [props.groupByField] : undefined;

    const events = useGridEvents(props.gridId || 'demo-grid');
    useEffect(() => {
        // events is no longer nullablex
        console.log('Setting up Grid Events listener for grid:', props.gridId);
        const unsubscribe = events.onRowClicked().listen((event) => {
            console.log('DEBUG: Row Clicked via useGridEvents:', event);
        });

        return () => {
            unsubscribe();
        };
    }, [events, props.gridId]);

    return (
        <div className="overflow-hidden border-primary/20 shadow-parchment glow-gold relative rounded-lg">
            {props.useServerSide && (
                <div className="bg-muted/30 border-b border-primary/10 px-4 py-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                            <Badge className="border-primary/30">
                                Server-side Mode
                            </Badge>
                            <span>
                                Dados vêm do backend com paginação assíncrona
                            </span>
                        </div>
                    </div>
                </div>
            )}
            <FiboGrid
                gridId={props.gridId}
                rowData={props.useServerSide ? [] : props.visibleRowData}
                columnDefs={columnDefs}
                getRowId={props.getRowId}
                rowSelection="multiple"
                onCellValueChanged={onCellValueChanged}
                height={700}
                showToolbar={true}
                showStatusBar={true}
                showRowNumbers={props.showRowNumbers}
                pagination={true}
                paginationMode={props.useServerSide ? 'server' : 'client'}
                serverSideDataSource={props.useServerSide ? dataSource : undefined}
                paginationPageSize={pageSize}
                paginationPageSizeOptions={pageOptions}
                groupByFields={groupFields}
                configs={props.configs}
                onGridReady={(e) => props.setGridApi(e.api)}
                rangeCellSelection={true}
                rowDragEnabled={false}
                onRowClickFallback={onRowClickFallback}
                lang={props.lang}
            />
        </div>
    );
}

