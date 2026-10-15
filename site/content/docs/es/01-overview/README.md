# 01 - Overview y arquitectura

## Ubicación

```
src/components/FiboGrid/
```

## Estructura de archivos

```
src/
├── index.ts                              # Entry point — re-exports de la API pública
├── components/
│   └── FiboGrid/
│       ├── FiboGrid.tsx                  # Componente principal (1023 líneas)
│       ├── types.ts                      # Todos los tipos TypeScript
│       ├── index.ts                      # Barrel export
│       ├── components/                   # Subcomponentes
│       │   ├── GridHeader.tsx            # Cabeceras de columnas con sorting
│       │   ├── GridRow.tsx               # Fila individual con virtualización
│       │   ├── GridCell.tsx              # Celda con editors/renderers
│       │   ├── GroupRow.tsx              # Filas de grupo con agregaciones
│       │   ├── GridToolbar.tsx           # Toolbar (search, filtros, export, columnas)
│       │   ├── GridFooter.tsx            # Footer
│       │   ├── GridPagination.tsx        # Controles de paginación
│       │   ├── GridStatusBar.tsx         # Barra de estado (conteo, selección, agregaciones)
│       │   ├── GridOverlay.tsx           # Overlays de loading/empty
│       │   ├── ColumnMenu.tsx            # Menú contextual de columna
│       │   ├── ColumnPanel.tsx           # Panel de visibilidad/orden de columnas
│       │   ├── FilterPanel.tsx           # UI de filtros avanzados
│       │   ├── FilterPopover.tsx         # Popover de selección de valores
│       │   ├── ContextMenu.tsx           # Menú contextual (right-click)
│       │   ├── VirtualFilterList.tsx     # Lista de filtros virtualizada
│       │   └── SpecialRenderers.tsx      # Renderers built-in
│       ├── context/
│       │   ├── GridContext.tsx            # GridProvider + useGridContext
│       │   └── GridRegistryContext.tsx    # GridRegistryProvider (multi-grid)
│       ├── hooks/
│       │   ├── useFiboGrid.ts            # Hook principal — acceso externo al grid
│       │   ├── useGridState.ts           # Orquestador de estado completo
│       │   ├── useVirtualization.ts      # Virtual scrolling (más de 100k filas)
│       │   ├── useColumnResize.ts        # Redimensionar columnas
│       │   ├── useColumnDrag.ts          # Drag-and-drop de columnas
│       │   ├── useRowDrag.ts             # Drag-and-drop de filas
│       │   ├── useRangeSelection.ts      # Selección de rango de celdas (Excel-style)
│       │   ├── useRowRangeSelection.ts   # Selección de rango de filas
│       │   ├── useKeyboardNavigation.ts  # Navegación por teclado + atajos
│       │   ├── useGrouping.ts            # Agrupación de filas
│       │   ├── useCellSelection.ts       # Selección individual de celdas
│       │   ├── useUndoRedo.ts            # Undo/Redo (máx. 50 de historial)
│       │   ├── useFillHandle.ts          # Fill handle para extender selecciones
│       │   ├── useGridEvents.ts          # Suscripciones a eventos del grid
│       │   ├── useServerSideData.ts      # Carga server-side
│       │   └── grid-state/              # Sub-hooks de estado interno
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
│       │   ├── EventBuilder.ts           # Sistema de eventos con suscripciones
│       │   ├── excelExport.ts            # Export a Excel (XLSX)
│       │   ├── grouping.ts              # groupRowsByFields, agregaciones
│       │   ├── shortcuts.ts             # Sistema de atajos de teclado
│       │   └── permissionValidator.ts   # Validación Ingress/Egress
│       ├── locales/                      # 9 archivos de idioma
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
│           └── lib.css                   # Estilos base
├── ui/                                   # Componentes shadcn/ui (40+)
├── pages/                                # Páginas demo
├── examples/                             # Ejemplos de implementación
└── lib/                                  # Utilidades generales
```

## Arquitectura

```
FiboGrid<T> (componente principal)
        ↓
useGridState (orquestador de estado)
        ↓
┌───────────────────────────────────────────────┐
│  useGridColumns      → procesamiento de columnas│
│  useGridSortFilter   → sort + filter + quick   │
│  useGridRows         → rows + server-side       │
│  useGridSelection    → single/multiple/range    │
│  useGridPagination   → client/server paginación │
│  useGridEditing      → edición inline + undo    │
│  useGridEventSystem  → pub/sub de eventos       │
│  useGrouping         → agrupación + agregaciones│
└───────────────────────────────────────────────┘
        ↓
useGridApi → monta GridApi<T> con todos los métodos
        ↓
GridApiBuilder (fluent)  +  GridManagerBuilder (CRUD)
        ↓
GridRegistryProvider → comunicación entre grids
```

## Flujo de datos

```
1. FiboGridProps recibe rowData, columnDefs y configuraciones
2. useGridState orquesta todos los sub-hooks de estado
3. useGridColumns procesa columnas (flex, width, pin, order)
4. useGridRows crea RowNode<T>[] con IDs únicos
5. useGridSortFilter aplica sort y filtros sobre los RowNodes
6. useGridPagination divide las rows por página
7. useVirtualization renderiza solo las filas visibles en el viewport
8. useGridApi monta la API pública con todos los métodos
9. GridRegistryProvider registra el grid para comunicación multi-grid
10. EventBuilder emite eventos para listeners internos y externos
```

## API pública (exports de fibogrid)

### Principal
- `FiboGrid` — componente principal
- `GridProvider`, `useGridContext`
- `GridRegistryProvider`, `useGridRegistry`, `useGridEvent`

### Hooks
- `useFiboGrid`, `useGridState`, `useGridEvents`
- `useVirtualization`, `useColumnResize`, `useColumnDrag`, `useRowDrag`

### Componentes
- `GridToolbar`, `GridStatusBar`, `ColumnMenu`, `GroupRow`, `ColumnPanel`, `FilterPanel`

### Utilidades
- `exportToExcel`, `EventBuilder`
- `generateRowId`, `createRowNode`, `processColumns`, `sortRows`, `filterRows`
- `groupRowsByFields`

### Locales
- `enUS`, `ptBR`, `frFR`, `jaJP`, `zhCN`, `ruRU`, `esES`, `caES`, `koKR`

### Tipos
- Todos exportados vía `export * from './types'`
