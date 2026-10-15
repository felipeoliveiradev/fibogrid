# 01 - Overview & Architecture

## Location

```
src/components/FiboGrid/
```

## File Structure

```
src/
├── index.ts                              # Entry point — public API re-exports
├── components/
│   └── FiboGrid/
│       ├── FiboGrid.tsx                  # Main component (1023 lines)
│       ├── types.ts                      # All TypeScript types
│       ├── index.ts                      # Barrel export
│       ├── components/                   # Sub-components
│       │   ├── GridHeader.tsx            # Column headers with sorting
│       │   ├── GridRow.tsx               # Single row with virtualization
│       │   ├── GridCell.tsx              # Cell with editors/renderers
│       │   ├── GroupRow.tsx              # Group rows with aggregations
│       │   ├── GridToolbar.tsx           # Toolbar (search, filters, export, columns)
│       │   ├── GridFooter.tsx            # Footer
│       │   ├── GridPagination.tsx        # Pagination controls
│       │   ├── GridStatusBar.tsx         # Status bar (count, selection, aggregations)
│       │   ├── GridOverlay.tsx           # Loading/empty overlays
│       │   ├── ColumnMenu.tsx            # Column context menu
│       │   ├── ColumnPanel.tsx           # Column visibility/order panel
│       │   ├── FilterPanel.tsx           # Advanced filters UI
│       │   ├── FilterPopover.tsx         # Value selection popover
│       │   ├── ContextMenu.tsx           # Context menu (right-click)
│       │   ├── VirtualFilterList.tsx     # Virtualized filter list
│       │   └── SpecialRenderers.tsx      # Built-in renderers
│       ├── context/
│       │   ├── GridContext.tsx            # GridProvider + useGridContext
│       │   └── GridRegistryContext.tsx    # GridRegistryProvider (multi-grid)
│       ├── hooks/
│       │   ├── useFiboGrid.ts            # Main hook — external access to the grid
│       │   ├── useGridState.ts           # Full state orchestrator
│       │   ├── useVirtualization.ts      # Virtual scrolling (100k+ rows)
│       │   ├── useColumnResize.ts        # Column resizing
│       │   ├── useColumnDrag.ts          # Column drag-and-drop
│       │   ├── useRowDrag.ts             # Row drag-and-drop
│       │   ├── useRangeSelection.ts      # Cell range selection (Excel-style)
│       │   ├── useRowRangeSelection.ts   # Row range selection
│       │   ├── useKeyboardNavigation.ts  # Keyboard navigation + shortcuts
│       │   ├── useGrouping.ts            # Row grouping
│       │   ├── useCellSelection.ts       # Individual cell selection
│       │   ├── useUndoRedo.ts            # Undo/Redo (max 50 history entries)
│       │   ├── useFillHandle.ts          # Fill handle to extend selections
│       │   ├── useGridEvents.ts          # Grid event subscriptions
│       │   ├── useServerSideData.ts      # Server-side loading
│       │   └── grid-state/              # Internal state sub-hooks
│       │       ├── useGridEventSystem.ts
│       │       ├── useGridColumns.ts
│       │       ├── useGridSortFilter.ts
│       │       ├── useGridPaginationState.ts
│       │       ├── useGridPaginationInfo.ts
│       │       ├── useGridRows.ts
│       │       ├── useGridSelection.ts
│       │       ├── useGridEditing.ts
│       │       ├── useGridApi.ts
│       │       └── useClickDetector.ts
│       ├── utils/
│       │   ├── helpers.ts                # generateRowId, createRowNode, processColumns, sortRows, filterRows
│       │   ├── EventBuilder.ts           # Event system with subscriptions
│       │   ├── excelExport.ts            # Excel export (XLSX)
│       │   ├── grouping.ts              # groupRowsByFields, aggregations
│       │   ├── shortcuts.ts             # Keyboard shortcut system
│       │   └── permissionValidator.ts   # Ingress/Egress validation
│       ├── locales/                      # 9 language files
│       │   ├── types.ts                  # FiboGridLocale interface
│       │   ├── enUS.ts
│       │   ├── ptBR.ts
│       │   ├── frFR.ts
│       │   ├── jaJP.ts
│       │   ├── zhCN.ts
│       │   ├── ruRU.ts
│       │   ├── esES.ts
│       │   ├── caES.ts
│       │   └── koKR.ts
│       ├── constants/
│       │   └── permissions.ts            # GridPermissions (Manager, API, Events)
│       └── styles/
│           ├── theme.css                 # CSS Variables (light + dark)
│           └── lib.css                   # Base styles
├── ui/                                   # shadcn/ui components (40+)
├── pages/                                # Demo pages
├── examples/                             # Implementation examples
└── lib/                                  # General utilities
```

## Architecture

```
FiboGrid<T> (main component)
        ↓
useGridState (state orchestrator)
        ↓
┌───────────────────────────────────────────────┐
│  useGridColumns      → column processing      │
│  useGridSortFilter   → sort + filter + quick  │
│  useGridRows         → rows + server-side     │
│  useGridSelection    → single/multiple/range  │
│  useGridPagination   → client/server paging   │
│  useGridEditing      → inline editing + undo  │
│  useGridEventSystem  → event pub/sub          │
│  useGrouping         → grouping + aggregations│
└───────────────────────────────────────────────┘
        ↓
useGridApi → assembles GridApi<T> with all methods
        ↓
GridApiBuilder (fluent)  +  GridManagerBuilder (CRUD)
        ↓
GridRegistryProvider → communication between grids
```

## Data Flow

```
1. FiboGridProps receives rowData, columnDefs and settings
2. useGridState orchestrates all state sub-hooks
3. useGridColumns processes columns (flex, width, pin, order)
4. useGridRows creates RowNode<T>[] with unique IDs
5. useGridSortFilter applies sort and filters over the RowNodes
6. useGridPagination slices the rows by page
7. useVirtualization renders only the rows visible in the viewport
8. useGridApi assembles the public API with all methods
9. GridRegistryProvider registers the grid for multi-grid communication
10. EventBuilder emits events to internal and external listeners
```

## Public API (fibogrid exports)

### Main
- `FiboGrid` — main component
- `GridProvider`, `useGridContext`
- `GridRegistryProvider`, `useGridRegistry`, `useGridEvent`

### Hooks
- `useFiboGrid`, `useGridState`, `useGridEvents`
- `useVirtualization`, `useColumnResize`, `useColumnDrag`, `useRowDrag`

### Components
- `GridToolbar`, `GridStatusBar`, `ColumnMenu`, `GroupRow`, `ColumnPanel`, `FilterPanel`

### Utilities
- `exportToExcel`, `EventBuilder`
- `generateRowId`, `createRowNode`, `processColumns`, `sortRows`, `filterRows`
- `groupRowsByFields`

### Locales
- `enUS`, `ptBR`, `frFR`, `jaJP`, `zhCN`, `ruRU`, `esES`, `caES`, `koKR`

### Types
- All exported via `export * from './types'`
