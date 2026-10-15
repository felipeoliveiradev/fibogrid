# 01 - Overview & Arquitetura

## Localizacao

```
src/components/FiboGrid/
```

## Estrutura de Ficheiros

```
src/
├── index.ts                              # Entry point — re-exports da API publica
├── components/
│   └── FiboGrid/
│       ├── FiboGrid.tsx                  # Componente principal (1023 linhas)
│       ├── types.ts                      # Todos os tipos TypeScript
│       ├── index.ts                      # Barrel export
│       ├── components/                   # Sub-componentes
│       │   ├── GridHeader.tsx            # Cabeçalhos de colunas com sorting
│       │   ├── GridRow.tsx               # Linha individual com virtualizacao
│       │   ├── GridCell.tsx              # Celula com editors/renderers
│       │   ├── GroupRow.tsx              # Linhas de grupo com agregacoes
│       │   ├── GridToolbar.tsx           # Toolbar (search, filtros, export, colunas)
│       │   ├── GridFooter.tsx            # Footer
│       │   ├── GridPagination.tsx        # Controles de paginacao
│       │   ├── GridStatusBar.tsx         # Barra de status (contagem, selecao, agregacoes)
│       │   ├── GridOverlay.tsx           # Overlays de loading/empty
│       │   ├── ColumnMenu.tsx            # Menu de contexto de coluna
│       │   ├── ColumnPanel.tsx           # Painel de visibilidade/ordem de colunas
│       │   ├── FilterPanel.tsx           # UI de filtros avancados
│       │   ├── FilterPopover.tsx         # Popover de selecao de valores
│       │   ├── ContextMenu.tsx           # Menu de contexto (right-click)
│       │   ├── VirtualFilterList.tsx     # Lista de filtros virtualizada
│       │   └── SpecialRenderers.tsx      # Renderers built-in
│       ├── context/
│       │   ├── GridContext.tsx            # GridProvider + useGridContext
│       │   └── GridRegistryContext.tsx    # GridRegistryProvider (multi-grid)
│       ├── hooks/
│       │   ├── useFiboGrid.ts            # Hook principal — acesso externo ao grid
│       │   ├── useGridState.ts           # Orquestrador de estado completo
│       │   ├── useVirtualization.ts      # Virtual scrolling (100k+ linhas)
│       │   ├── useColumnResize.ts        # Redimensionar colunas
│       │   ├── useColumnDrag.ts          # Drag-and-drop de colunas
│       │   ├── useRowDrag.ts             # Drag-and-drop de linhas
│       │   ├── useRangeSelection.ts      # Selecao de range de celulas (Excel-style)
│       │   ├── useRowRangeSelection.ts   # Selecao de range de linhas
│       │   ├── useKeyboardNavigation.ts  # Navegacao por teclado + atalhos
│       │   ├── useGrouping.ts            # Agrupamento de linhas
│       │   ├── useCellSelection.ts       # Selecao individual de celulas
│       │   ├── useUndoRedo.ts            # Undo/Redo (max 50 historico)
│       │   ├── useFillHandle.ts          # Fill handle para estender selecoes
│       │   ├── useGridEvents.ts          # Subscricoes de eventos do grid
│       │   ├── useServerSideData.ts      # Carregamento server-side
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
│       │   ├── EventBuilder.ts           # Sistema de eventos com subscricoes
│       │   ├── excelExport.ts            # Export para Excel (XLSX)
│       │   ├── grouping.ts              # groupRowsByFields, agregacoes
│       │   ├── shortcuts.ts             # Sistema de atalhos de teclado
│       │   └── permissionValidator.ts   # Validacao Ingress/Egress
│       ├── locales/                      # 9 ficheiros de idioma
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
├── pages/                                # Paginas demo
├── examples/                             # Exemplos de implementacao
└── lib/                                  # Utilitarios gerais
```

## Arquitetura

```
FiboGrid<T> (componente principal)
        ↓
useGridState (orquestrador de estado)
        ↓
┌───────────────────────────────────────────────┐
│  useGridColumns      → processamento de colunas│
│  useGridSortFilter   → sort + filter + quick   │
│  useGridRows         → rows + server-side       │
│  useGridSelection    → single/multiple/range    │
│  useGridPagination   → client/server paginacao  │
│  useGridEditing      → edicao inline + undo     │
│  useGridEventSystem  → pub/sub de eventos       │
│  useGrouping         → agrupamento + agregacoes │
└───────────────────────────────────────────────┘
        ↓
useGridApi → monta GridApi<T> com todos os metodos
        ↓
GridApiBuilder (fluent)  +  GridManagerBuilder (CRUD)
        ↓
GridRegistryProvider → comunicacao entre grids
```

## Fluxo de Dados

```
1. FiboGridProps recebe rowData, columnDefs e configuracoes
2. useGridState orquestra todos os sub-hooks de estado
3. useGridColumns processa colunas (flex, width, pin, order)
4. useGridRows cria RowNode<T>[] com IDs unicos
5. useGridSortFilter aplica sort e filtros sobre os RowNodes
6. useGridPagination fatia os rows por pagina
7. useVirtualization renderiza apenas as linhas visiveis no viewport
8. useGridApi monta a API publica com todos os metodos
9. GridRegistryProvider registra o grid para comunicacao multi-grid
10. EventBuilder emite eventos para listeners internos e externos
```

## API Publica (exports de fibogrid)

### Principal
- `FiboGrid` — componente principal
- `GridProvider`, `useGridContext`
- `GridRegistryProvider`, `useGridRegistry`, `useGridEvent`

### Hooks
- `useFiboGrid`, `useGridState`, `useGridEvents`
- `useVirtualization`, `useColumnResize`, `useColumnDrag`, `useRowDrag`

### Componentes
- `GridToolbar`, `GridStatusBar`, `ColumnMenu`, `GroupRow`, `ColumnPanel`, `FilterPanel`

### Utilitarios
- `exportToExcel`, `EventBuilder`
- `generateRowId`, `createRowNode`, `processColumns`, `sortRows`, `filterRows`
- `groupRowsByFields`

### Locales
- `enUS`, `ptBR`, `frFR`, `jaJP`, `zhCN`, `ruRU`, `esES`, `caES`, `koKR`

### Tipos
- Todos exportados via `export * from './types'`
