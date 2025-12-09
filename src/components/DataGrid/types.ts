// Core Types for DataGrid

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
  hide?: boolean;
  filterType?: FilterType;
  cellEditor?: CellEditorType;
  cellEditorParams?: Record<string, any>;
  cellRenderer?: (params: CellRendererParams<T>) => React.ReactNode;
  headerRenderer?: (params: HeaderRendererParams<T>) => React.ReactNode;
  valueFormatter?: (value: any, row: T) => string;
  valueParser?: (value: string) => any;
  comparator?: (a: any, b: any) => number;
  filterComparator?: (filterValue: any, cellValue: any) => boolean;
  cellClass?: string | ((params: CellRendererParams<T>) => string);
  headerClass?: string;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  rowDrag?: boolean;
  suppressMenu?: boolean;
  aggFunc?: 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: any[]) => any);
}

export interface CellRendererParams<T = any> {
  value: any;
  data: T;
  rowIndex: number;
  colDef: ColumnDef<T>;
  column: ProcessedColumn<T>;
  api: GridApi<T>;
}

export interface HeaderRendererParams<T = any> {
  colDef: ColumnDef<T>;
  column: ProcessedColumn<T>;
  api: GridApi<T>;
}

export interface ProcessedColumn<T = any> extends ColumnDef<T> {
  computedWidth: number;
  left: number;
  index: number;
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

export interface SortModel {
  field: string;
  direction: SortDirection;
}

export interface FilterModel {
  field: string;
  filterType: FilterType;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
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

// Server-side pagination types
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
  // Data
  setRowData: (data: T[]) => void;
  getRowData: () => T[];
  getDisplayedRows: () => RowNode<T>[];
  getRowNode: (id: string) => RowNode<T> | null;
  updateRowData: (updates: { add?: T[]; update?: T[]; remove?: T[] }) => void;
  forEachNode: (callback: (node: RowNode<T>) => void) => void;
  getDisplayedRowCount: () => number;
  getDisplayedRowAtIndex: (index: number) => RowNode<T> | null;
  
  // Selection
  selectAll: () => void;
  deselectAll: () => void;
  selectRow: (id: string, selected?: boolean) => void;
  selectRows: (ids: string[], selected?: boolean) => void;
  getSelectedRows: () => RowNode<T>[];
  getSelectedNodes: () => RowNode<T>[];
  
  // Sorting
  setSortModel: (model: SortModel[]) => void;
  getSortModel: () => SortModel[];
  
  // Filtering
  setFilterModel: (model: FilterModel[]) => void;
  getFilterModel: () => FilterModel[];
  setQuickFilter: (text: string) => void;
  
  // Columns
  getColumnDefs: () => ColumnDef<T>[];
  setColumnVisible: (field: string, visible: boolean) => void;
  setColumnPinned: (field: string, pinned: 'left' | 'right' | null) => void;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  resizeColumn: (field: string, width: number) => void;
  autoSizeColumn: (field: string) => void;
  autoSizeAllColumns: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // Editing
  startEditingCell: (rowId: string, field: string) => void;
  stopEditing: (cancel?: boolean) => void;
  
  // Scroll
  ensureRowVisible: (id: string) => void;
  ensureColumnVisible: (field: string) => void;
  scrollTo: (position: { top?: number; left?: number }) => void;
  
  // Export
  exportToCsv: (params?: ExportParams) => void;
  copyToClipboard: (includeHeaders?: boolean) => Promise<void>;
  
  // Events
  refreshCells: () => void;
  redrawRows: () => void;
}

export interface ExportParams {
  fileName?: string;
  columnKeys?: string[];
  onlySelected?: boolean;
  skipHeader?: boolean;
}

export interface RowClickFallbackEvent<T = any> {
  clickType: 'single' | 'double' | 'triple' | number;
  rowData: T;
  allRowsData: T[];
  rowNode: RowNode<T>;
  event: React.MouseEvent;
  api: GridApi<T>;
  // Cell information if clicked on a specific cell
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

export interface CellDoubleClickedEvent<T = any> extends CellClickedEvent<T> {}

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

export interface RowDoubleClickedEvent<T = any> extends RowClickedEvent<T> {}

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

export interface DataGridProps<T = any> extends GridEvents<T> {
  rowData: T[];
  columnDefs: ColumnDef<T>[];
  getRowId?: (data: T) => string;
  
  // Grid identification for shared state
  gridId?: string;
  
  // Features
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
  
  // Virtualization
  rowHeight?: number;
  headerHeight?: number;
  rowBuffer?: number;
  
  // Styling
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  height?: number | string;
  
  // Loading
  loading?: boolean;
  loadingOverlayComponent?: React.ReactNode;
  noRowsOverlayComponent?: React.ReactNode;
  
  // Quick filter
  quickFilterText?: string;
  
  // Filter options
  enableFilterValueVirtualization?: boolean;
  filterValues?: Record<string, any[]>; // Custom filter values per column field
  
  // Toolbar & Status bar
  showToolbar?: boolean;
  showStatusBar?: boolean;
  showRowNumbers?: boolean;
  
  // Context menu
  contextMenu?: boolean;
  getContextMenuItems?: (params: CellRendererParams<T>) => ContextMenuItem[];
  
  // Grouping
  groupByFields?: string[];
  splitByField?: string;
  groupAggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count'>;
  
  // Tree data / Child rows
  treeData?: boolean;
  getChildRows?: (parentData: T) => T[] | Promise<T[]>;
  childRowsField?: string;
}

export interface ContextMenuItem {
  name: string;
  action: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  subMenu?: ContextMenuItem[];
  separator?: boolean;
}
