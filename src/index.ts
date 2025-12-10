// Styles - use lib version for build that doesn't include Tailwind base
import './components/FiboGrid/styles/lib.css';

// Main exports
export { FiboGrid } from './components/FiboGrid';
export * from './components/FiboGrid/types';
export * from './components/FiboGrid/utils/helpers';
export { GridProvider, useGridContext } from './components/FiboGrid/context/GridContext';
export * from './components/FiboGrid/utils/grouping';
export { exportToExcel } from './components/FiboGrid/utils/excelExport';

// Hooks
export { useGridState } from './components/FiboGrid/hooks/useGridState';
export { useVirtualization } from './components/FiboGrid/hooks/useVirtualization';
export { useColumnResize } from './components/FiboGrid/hooks/useColumnResize';
export { useColumnDrag } from './components/FiboGrid/hooks/useColumnDrag';
export { useRowDrag } from './components/FiboGrid/hooks/useRowDrag';
export { useRangeSelection } from './components/FiboGrid/hooks/useRangeSelection';
export { useKeyboardNavigation } from './components/FiboGrid/hooks/useKeyboardNavigation';
export { useGrouping } from './components/FiboGrid/hooks/useGrouping';
export { useCellSelection } from './components/FiboGrid/hooks/useCellSelection';
export { useUndoRedo } from './components/FiboGrid/hooks/useUndoRedo';
export { useFillHandle } from './components/FiboGrid/hooks/useFillHandle';

// Additional Components
export { GridToolbar } from './components/FiboGrid/components/GridToolbar';
export { GridStatusBar } from './components/FiboGrid/components/GridStatusBar';
export { ColumnMenu } from './components/FiboGrid/components/ColumnMenu';
export { GroupRow } from './components/FiboGrid/components/GroupRow';
export { ColumnPanel } from './components/FiboGrid/components/ColumnPanel';
export { FilterPanel } from './components/FiboGrid/components/FilterPanel';

// Locales
export type { FiboGridLocale } from './components/FiboGrid/locales/types';
export { enUS } from './components/FiboGrid/locales/enUS';
export { ptBR } from './components/FiboGrid/locales/ptBR';
