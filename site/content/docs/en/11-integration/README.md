# 11 - Integration

## Quick Guide by Use Case

| Task | Section |
|--------|--------|
| Create a basic grid with data | `10-examples/#1` |
| Add pagination, toolbar and status bar | `04-components/`, `10-examples/#2` |
| Inline cell editing | `08-patterns/` — Inline Editing, `10-examples/#3` |
| Single/multiple selection with actions | `08-patterns/` — Selection, `10-examples/#4` |
| Master-Detail with two grids | `06-advanced/` — Grid Registry, `10-examples/#5` |
| Server-side pagination | `06-advanced/` — Server-Side, `10-examples/#6` |
| Group rows with aggregations | `06-advanced/` — Row Grouping, `10-examples/#7` |
| Atomic operations (filter+sort+page) | `05-api/` — GridApiBuilder, `10-examples/#8` |
| Data CRUD (add/update/remove) | `05-api/` — GridManagerBuilder, `08-patterns/` — Dynamic Data |
| Reactive event subscriptions | `05-api/` — EventBuilder, `10-examples/#9` |
| Customize themes and styles | `07-configuration/` — Themes |
| Change the grid language | `09-localization/` |
| Define permissions between grids | `06-advanced/` — Ingress/Egress |
| Custom keyboard shortcuts | `06-advanced/` — Keyboard Shortcuts, `10-examples/#10` |
| Right-click context menu | `04-components/`, `10-examples/#11` |
| Export CSV/Excel | `08-patterns/` — Export |
| Hierarchical tree data | `06-advanced/` — Tree Data |
| Custom layout (header/footer) | `07-configuration/` — FiboGridConfigs |
| Complete TypeScript types | `02-types/` |
| All available hooks | `03-hooks/` |

---

## Import Path

```typescript
// Componente + tipos
import { FiboGrid, type ColumnDef, type GridApi, type RowNode } from 'fibogrid';

// Estilos (obrigatorio no entry point)
import 'fibogrid/styles.css';

// Hooks
import { useFiboGrid, useGridEvent, useGridRegistry } from 'fibogrid';

// Contexto multi-grid
import { GridRegistryProvider } from 'fibogrid';

// Locales
import { ptBR, esES, frFR } from 'fibogrid';

// Utilitarios
import { exportToExcel, EventBuilder } from 'fibogrid';

// Componentes individuais
import { GridToolbar, GridStatusBar, ColumnPanel, FilterPanel } from 'fibogrid';

// Permissoes
import { GridPermissions } from 'fibogrid';
```

---

## Recommended Usage Structure

```
features/meu-modulo/
├── components/
│   ├── MeuGrid.tsx                # Componente com FiboGrid
│   └── MeuGridActions.tsx         # Botoes/acoes externas ao grid
├── hooks/
│   └── useMeuGrid.hook.ts        # Hook que encapsula API do grid
├── columns/
│   └── meu-grid.columns.ts       # Definicoes de colunas
├── types.ts                       # Tipos do modulo
└── api/
    └── meu-modulo.api.ts          # Chamadas ao backend
```

### Separation Example

```typescript
// columns/produtos.columns.ts
import type { ColumnDef } from 'fibogrid';
import type { Produto } from '../types';

export const produtoColunas: ColumnDef<Produto>[] = [
  { field: 'id', headerName: 'ID', width: 80, pinned: 'left' },
  { field: 'nome', headerName: 'Nome', flex: 1, editable: true },
  { field: 'preco', headerName: 'Preco', width: 120, valueFormatter: (v) => `R$ ${v.toFixed(2)}` },
  { field: 'categoria', headerName: 'Categoria', filterable: true },
];
```

```typescript
// hooks/useProdutoGrid.hook.ts
import { useRef, useCallback } from 'react';
import type { GridApi } from 'fibogrid';
import type { Produto } from '../types';

export function useProdutoGrid() {
  const apiRef = useRef<GridApi<Produto>>();

  const onGridReady = useCallback((e: { api: GridApi<Produto> }) => {
    apiRef.current = e.api;
  }, []);

  const removerSelecionados = useCallback(() => {
    const selected = apiRef.current?.getSelectedRows() ?? [];
    apiRef.current?.manager()
      .remove(selected.map(r => r.id))
      .execute();
  }, []);

  const filtrarPorCategoria = useCallback((cat: string) => {
    apiRef.current?.params()
      .removeAllFilter()
      .setFilterModel([{ field: 'categoria', filterType: 'text', value: cat, operator: 'equals' }])
      .setPage(0)
      .execute();
  }, []);

  return { apiRef, onGridReady, removerSelecionados, filtrarPorCategoria };
}
```

---

## Complete Documentation Tree

```
docs/
├── README.md                         # Indice geral + quick start + stack + estatisticas
├── 01-overview/
│   └── README.md                     # Arquitetura, estrutura de ficheiros, fluxo de dados, API publica
├── 02-types/
│   └── README.md                     # ColumnDef, RowNode, GridState, Events, Keyboard, Context Menu, Layout
├── 03-hooks/
│   └── README.md                     # 15+ hooks: useFiboGrid, useGridState, useVirtualization, useColumnResize,
│                                     #   useColumnDrag, useRowDrag, useRangeSelection, useRowRangeSelection,
│                                     #   useKeyboardNavigation, useCellSelection, useFillHandle, useUndoRedo,
│                                     #   useGrouping, useServerSideData, useGridEvents, useGridEvent
│                                     #   + 10 hooks internos (grid-state/) com retornos detalhados
├── 04-components/
│   ├── README.md                     # FiboGrid (props+eventos), GridToolbar, GridStatusBar, ColumnMenu,
│   │                                 #   GroupRow, ColumnPanel, FilterPanel + componentes internos
│   └── special-renderers.md          # RowNumberRenderer, CheckboxCellRenderer, CheckboxHeaderRenderer, GridContext
├── 05-api/
│   ├── README.md                     # GridApi (50+ metodos), GridApiBuilder (fluent), GridManagerBuilder (CRUD),
│   │                                 #   EventBuilder + subscricoes especializadas + DiffSubscription
│   └── utils.md                      # helpers (generateRowId, createRowNode, processColumns, sortRows, filterRows,
│                                     #   fastComparator, defaultComparator, getValueFromPath, setValueAtPath),
│                                     #   grouping (isGroupNode, groupRowsByFields, splitRowsByField, addChildRows,
│                                     #   flattenGroupedRows + tipos GroupRowNode/RegularRowNode/GroupableRowNode),
│                                     #   shortcuts (isShortcutMatch, defaultShortcuts 10 built-in),
│                                     #   excelExport (exportToExcel, exportToExcelWithStyles),
│                                     #   permissionValidator (validateIngress), CSS (5 ficheiros, 80+ variaveis)
├── 06-advanced/
│   └── README.md                     # Grid Registry, Ingress/Egress (seguranca), Row Grouping, Split Rows,
│                                     #   Tree Data, Server-Side, Undo/Redo, Range Selection, Fill Handle, Shortcuts
├── 07-configuration/
│   └── README.md                     # FiboGridConfigs (header/center/footer), Temas (CSS Variables light+dark),
│                                     #   Densidade, Paginacao, Overlays, Filtros virtualizados
├── 08-patterns/
│   └── README.md                     # Colunas (basica, renderer, editor, acao, pinned, checkbox), Row ID,
│                                     #   Selecao, Filtros, Edicao, Export, Master-Detail, CRUD, Convencoes
├── 09-localization/
│   └── README.md                     # 9 idiomas, FiboGridLocale interface completa, locale custom
├── 10-examples/
│   └── README.md                     # 11 exemplos: basico, toolbar, edicao, selecao, master-detail,
│                                     #   server-side, grouping, fluent API, events, temas+atalhos, context menu
└── 11-integration/
    └── README.md                     # Guia rapido (18 tarefas), imports, estrutura recomendada
```
