export type SortDirection = 'asc' | 'desc' | null;

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export type CellEditorType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

export interface ColumnDef<T = any> {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  editable?: boolean;
  draggable?: boolean;
  pinned?: 'left' | 'right' | null;
  pinnedPriority?: number;
  hide?: boolean;
  filterType?: FilterType;
  type?: 'data' | 'action' | 'checkbox' | 'rowNumber';
  cellEditor?: CellEditorType;
  cellEditorParams?: Record<string, any>;
  cellRenderer?: (params: CellRendererParams<T>) => React.ReactNode;
  headerRenderer?: (params: HeaderRendererParams<T>) => React.ReactNode;
  valueFormatter?: (value: any, row: T) => string;
  valueParser?: (value: string) => any;
  valueSetter?: (params: ValueSetterParams<T>) => boolean;
  comparator?: (a: any, b: any) => number;
  filterComparator?: (filterValue: any, cellValue: any) => boolean;
  cellClass?: string | ((params: CellRendererParams<T>) => string);
  headerClass?: string;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  rowDrag?: boolean;
  suppressMenu?: boolean;
  aggFunc?: 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: any[]) => any);
  useInternalFilter?: boolean;
}

export interface CellRendererParams<T = any> {
  value: any;
  data: T;
  rowIndex: number;
  colDef: ColumnDef<T>;
  column: ProcessedColumn<T>;
  api: GridApi<T>;
  rowNode: RowNode<T>;
  selectedRows?: T[];
}

export interface HeaderRendererParams<T = any> {
  colDef: ColumnDef<T>;
  column: ProcessedColumn<T>;
  api: GridApi<T>;
}

export interface RowClassParams<T = any> {
  data: T;
  rowIndex: number;
  rowNode: RowNode<T>;
  api: GridApi<T>;
}

export interface ValueSetterParams<T = any> {
  oldValue: any;
  newValue: any;
  data: T;
  column: ProcessedColumn<T>;
  api: GridApi<T>;
}

export interface ProcessedColumn<T = any> extends ColumnDef<T> {
  computedWidth: number;
  left: number;
  index: number;
}

export interface ContextMenuItem {
  name?: string;
  action?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  subMenu?: ContextMenuItem[];
  separator?: boolean;
  cssClasses?: string[];
}

export interface RowNode<T = any> {
  id: string;
  data: T;
  rowIndex: number;
  selected: boolean;
  expanded?: boolean;
  level?: number;
  parent?: RowNode<T>;
  children?: RowNode<T>[];
  highlighted?: boolean;
}

export interface KeyboardEventParams<T = any> {
  event: React.KeyboardEvent | KeyboardEvent;
  api: GridApi<T>;
  focusRow: (index: number) => void;
  focusCell: (rowIndex: number, colIndex: number) => void;
  currentState: {
    rowIndex: number;
    colIndex: number;
    focusedCell: { rowId: string; field: string } | null;
  };
}

export interface ShortcutDef<T = any> {
  id: string;
  keys: string | string[];
  action: (params: KeyboardEventParams<T>) => void;
  description?: string;
  preventDefault?: boolean;
}

export interface SortModel {
  field: string;
  direction: SortDirection;
}

export interface FilterModel<T = any> {
  field: string;
  filterType: FilterType;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  meta?: T;
}

export interface SelectionState {
  selectedRows: Set<string>;
  lastSelectedIndex: number | null;
  anchorIndex: number | null;
}

export interface GridState<T = any> {
  rows: RowNode<T>[];
  displayedRows: RowNode<T>[];
  columns: ProcessedColumn<T>[];
  sortModel: SortModel[];
  filterModel: FilterModel[];
  selection: SelectionState;
  pagination: PaginationState;
  editingCell: EditingCell | null;
  columnOrder: string[];
  scrollPosition: { top: number; left: number };
}

export interface PaginationState {
  enabled: boolean;
  pageSize: number;
  currentPage: number;
  totalRows: number;
  totalPages: number;
}

export type PaginationMode = 'client' | 'server';

export interface ServerSideDataSourceRequest {
  page: number;
  pageSize: number;
  sortModel: SortModel[];
  filterModel: FilterModel[];
  quickFilterText?: string;
}

export interface ServerSideDataSourceResponse<T = any> {
  data: T[];
  totalRows: number;
  page: number;
  pageSize: number;
}

export interface ServerSideDataSource<T = any> {
  getRows: (request: ServerSideDataSourceRequest) => Promise<ServerSideDataSourceResponse<T>>;
}

export interface EditingCell {
  rowId: string;
  field: string;
  value: any;
  originalValue: any;
}

export interface GridApi<T = any> {
  addEventListener: (eventType: string, listener: (event: any) => void) => void;
  removeEventListener: (eventType: string, listener: (event: any) => void) => void;

  setRowData: (data: T[]) => void;
  getRowData: () => T[];
  getDisplayedRows: () => RowNode<T>[];
  getRowNode: (id: string) => RowNode<T> | null;
  updateRowData: (updates: { add?: T[]; update?: T[]; remove?: T[] }) => void;
  forEachNode: (callback: (node: RowNode<T>) => void) => void;
  getDisplayedRowCount: () => number;
  getDisplayedRowAtIndex: (index: number) => RowNode<T> | null;


  selectAll: () => void;
  deselectAll: () => void;
  selectRow: (id: string, selected?: boolean) => void;
  selectRows: (ids: string[], selected?: boolean) => void;
  getSelectedRows: () => RowNode<T>[];
  getSelectedNodes: () => RowNode<T>[];


  setSortModel: (model: SortModel[]) => void;
  getSortModel: () => SortModel[];


  setFilterModel: (model: FilterModel[], options?: SetFilterOptions) => void;
  getFilterModel: () => FilterModel[];
  setQuickFilter: (text: string) => void;


  getColumnDefs: () => ColumnDef<T>[];
  setColumnVisible: (field: string, visible: boolean) => void;
  setColumnPinned: (field: string, pinned: 'left' | 'right' | null) => void;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  resizeColumn: (field: string, width: number) => void;
  autoSizeColumn: (field: string) => void;
  autoSizeAllColumns: () => void;


  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;


  startEditingCell: (rowId: string, field: string) => void;
  stopEditing: (cancel?: boolean) => void;


  ensureRowVisible: (id: string) => void;
  ensureColumnVisible: (field: string) => void;
  scrollTo: (position: { top?: number; left?: number }) => void;


  exportToCsv: (params?: ExportParams) => void;
  copyToClipboard: (includeHeaders?: boolean) => Promise<void>;
  undo: () => void;
  pasteFromClipboard: () => Promise<void>;


  params: () => GridApiBuilder<T>;
  manager: () => GridManagerBuilder<T>;
  refreshCells: () => void;
  redrawRows: () => void;
  refresh: () => void;
}

export interface SetFilterOptions {
  behavior?: 'replace' | 'merge';
}

export interface GridApiBuilder<T = any> {
  setFilterModel: (model: FilterModel[], options?: SetFilterOptions) => GridApiBuilder<T>;
  removeFilter: (field: string) => GridApiBuilder<T>;
  removeAllFilter: () => GridApiBuilder<T>;
  setQuickFilter: (text: string) => GridApiBuilder<T>;
  removeQuickFilter: () => GridApiBuilder<T>;
  setSortModel: (model: SortModel[]) => GridApiBuilder<T>;
  removeSort: (field: string) => GridApiBuilder<T>;
  removeAllSort: () => GridApiBuilder<T>;
  setPage: (page: number) => GridApiBuilder<T>;
  setPageSize: (size: number) => GridApiBuilder<T>;
  setPagination: (state: Partial<PaginationState>) => GridApiBuilder<T>;
  selectRow: (id: string, selected?: boolean) => GridApiBuilder<T>;
  selectRows: (ids: string[], selected?: boolean) => GridApiBuilder<T>;
  selectAll: () => GridApiBuilder<T>;
  deselectAll: () => GridApiBuilder<T>;
  updateRowData: (updates: { add?: T[]; update?: T[]; remove?: T[] }) => GridApiBuilder<T>;
  resetState: () => GridApiBuilder<T>;
  resetEdits: () => GridApiBuilder<T>;
  resetCell: (rowId: string, field: string) => GridApiBuilder<T>;
  resetRow: (rowId: string) => GridApiBuilder<T>;
  gridManager: (callback: (manager: GridManagerBuilder<T>) => GridManagerBuilder<T>) => GridApiBuilder<T>;
  execute: () => void;
}

export interface GridManagerBuilder<T = any> {
  add: (rows: T[]) => GridManagerBuilder<T>;
  upAdd: (rows: T[]) => GridManagerBuilder<T>;
  replaceAll: (rows: T[]) => GridManagerBuilder<T>;
  remove: (rowIds: string[]) => GridManagerBuilder<T>;
  update: (rows: T[]) => GridManagerBuilder<T>;
  updateCell: (rowId: string, field: string, value: any) => GridManagerBuilder<T>;
  resetCell: (rowId: string, field: string) => GridManagerBuilder<T>;
  resetRow: (rowId: string) => GridManagerBuilder<T>;
  reset: () => GridManagerBuilder<T>;
  resetEdits: () => GridManagerBuilder<T>;
  execute: () => void;
}

export interface ExportParams {
  fileName?: string;
  columnKeys?: string[];
  onlySelected?: boolean;
  skipHeader?: boolean;
}

export interface RowClickFallbackEvent<T = any> {
  clickType: 'single' | 'double' | 'triple' | 'menu' | number;
  rowData: T;
  allRowsData: T[];
  rowNode: RowNode<T>;
  event: React.MouseEvent;
  api: GridApi<T>;

  cell?: {
    column: ProcessedColumn<T>;
    value: any;
    isEditable: boolean;
  };
}

export interface GridEvents<T = any> {
  onRowSelected?: (event: RowSelectedEvent<T>) => void;
  onSelectionChanged?: (event: SelectionChangedEvent<T>) => void;
  onCellClicked?: (event: CellClickedEvent<T>) => void;
  onCellDoubleClicked?: (event: CellDoubleClickedEvent<T>) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void;
  onRowClicked?: (event: RowClickedEvent<T>) => void;
  onRowDoubleClicked?: (event: RowDoubleClickedEvent<T>) => void;
  onRowClickFallback?: (event: RowClickFallbackEvent<T>) => void;
  onRowDragStart?: (event: RowDragEvent<T>) => void;
  onRowDragEnd?: (event: RowDragEvent<T>) => void;
  onRowDragMove?: (event: RowDragEvent<T>) => void;
  onSortChanged?: (event: SortChangedEvent) => void;
  onFilterChanged?: (event: FilterChangedEvent) => void;
  onColumnResized?: (event: ColumnResizedEvent<T>) => void;
  onColumnMoved?: (event: ColumnMovedEvent<T>) => void;
  onColumnVisible?: (event: ColumnVisibleEvent<T>) => void;
  onGridReady?: (event: GridReadyEvent<T>) => void;
  onPaginationChanged?: (event: PaginationChangedEvent) => void;
}

export interface RowSelectedEvent<T = any> {
  rowNode: RowNode<T>;
  selected: boolean;
  api: GridApi<T>;
}

export interface SelectionChangedEvent<T = any> {
  selectedRows: RowNode<T>[];
  api: GridApi<T>;
}

export interface CellClickedEvent<T = any> {
  rowNode: RowNode<T>;
  column: ProcessedColumn<T>;
  value: any;
  event: React.MouseEvent;
  api: GridApi<T>;
}

export interface CellDoubleClickedEvent<T = any> extends CellClickedEvent<T> { }

export interface CellValueChangedEvent<T = any> {
  rowNode: RowNode<T>;
  column: ProcessedColumn<T>;
  oldValue: any;
  newValue: any;
  api: GridApi<T>;
}

export interface RowClickedEvent<T = any> {
  rowNode: RowNode<T>;
  event: React.MouseEvent;
  api: GridApi<T>;
}

export interface RowDoubleClickedEvent<T = any> extends RowClickedEvent<T> { }

export interface RowDragEvent<T = any> {
  rowNode: RowNode<T>;
  overNode?: RowNode<T>;
  overIndex?: number;
  api: GridApi<T>;
}

export interface SortChangedEvent {
  sortModel: SortModel[];
}

export interface FilterChangedEvent {
  filterModel: FilterModel[];
}

export interface ColumnResizedEvent<T = any> {
  column: ProcessedColumn<T>;
  newWidth: number;
}

export interface ColumnMovedEvent<T = any> {
  column: ProcessedColumn<T>;
  fromIndex: number;
  toIndex: number;
}

export interface ColumnVisibleEvent<T = any> {
  column: ProcessedColumn<T>;
  visible: boolean;
}

export interface GridReadyEvent<T = any> {
  api: GridApi<T>;
}

export interface PaginationChangedEvent {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRows: number;
}


export type HeaderLayoutItem = 'search' | 'active-filters' | 'filter-button' | 'density-button' | 'export-button' | 'columns-button' | 'copy-button' | 'refresh-button' | 'custom-actions' | 'spacer';
export type FooterLayoutItem = 'pagination' | 'pagination-page-size' | 'pagination-info' | 'pagination-controls' | 'status-bar' | 'status-info' | 'status-selected' | 'status-aggregations' | 'spacer';

export interface FiboGridConfigs {
  header?: {
    show?: boolean;
    layout?: HeaderLayoutItem[];
    search?: boolean;
    filterButton?: boolean;
    densityButton?: boolean;
    exportButton?: boolean;
    columnsButton?: boolean;
    copyButton?: boolean;
    refreshButton?: boolean;
    filterRow?: boolean;
    customActions?: React.ReactNode;
  };
  center?: {
    rowNumbers?: boolean;
    checkboxSelection?: boolean;
    stripes?: boolean;
    borders?: boolean;
  };
  footer?: {
    show?: boolean;
    layout?: FooterLayoutItem[];
    pagination?: boolean;
    information?: boolean;
  };
}

export interface FiboGridProps<T = any> extends GridEvents<T> {
  rowData: T[];
  columnDefs: ColumnDef<T>[];
  getRowId?: (data: T) => string;


  configs?: FiboGridConfigs;

  gridId?: string;


  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeOptions?: number[];
  paginationMode?: PaginationMode;
  serverSideDataSource?: ServerSideDataSource<T>;

  rowSelection?: 'single' | 'multiple';
  rangeCellSelection?: boolean;
  rowDragEnabled?: boolean;
  rowDragManaged?: boolean;

  defaultColDef?: Partial<ColumnDef<T>>;

  getRowClass?: (params: RowClassParams<T>) => string | string[] | undefined;

  rowHeight?: number;
  headerHeight?: number;
  rowBuffer?: number;


  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  height?: number | string;


  loading?: boolean;
  loadingOverlayComponent?: React.ReactNode;
  noRowsOverlayComponent?: React.ReactNode;


  quickFilterText?: string;


  enableFilterValueVirtualization?: boolean;
  filterValues?: Record<string, any[]>;


  showToolbar?: boolean;
  showStatusBar?: boolean;
  showRowNumbers?: boolean;


  contextMenu?: boolean;
  getContextMenuItems?: (params: CellRendererParams<T>) => ContextMenuItem[];


  groupByFields?: string[];
  splitByField?: string;
  groupAggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count'>;


  treeData?: boolean;
  getChildRows?: (parentData: T) => T[] | Promise<T[]>;
  childRowsField?: string;

  lang?: import('./locales/types').FiboGridLocale;
  shortcuts?: boolean | ShortcutDef<T>[];
}


