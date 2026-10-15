# 11 - 集成

## 按使用场景快速指南

| 任务 | 章节 |
|--------|--------|
| 使用数据创建基础表格 | `10-examples/#1` |
| 添加分页、工具栏和状态栏 | `04-components/`, `10-examples/#2` |
| 单元格内联编辑 | `08-patterns/` — 内联编辑, `10-examples/#3` |
| 带操作的单选/多选 | `08-patterns/` — 选择, `10-examples/#4` |
| 两个表格的主从 (Master-Detail) | `06-advanced/` — Grid Registry, `10-examples/#5` |
| 服务端分页 | `06-advanced/` — Server-Side, `10-examples/#6` |
| 带聚合的行分组 | `06-advanced/` — Row Grouping, `10-examples/#7` |
| 原子操作（过滤+排序+分页） | `05-api/` — GridApiBuilder, `10-examples/#8` |
| 数据 CRUD（add/update/remove） | `05-api/` — GridManagerBuilder, `08-patterns/` — 动态数据 |
| 响应式事件订阅 | `05-api/` — EventBuilder, `10-examples/#9` |
| 自定义主题和样式 | `07-configuration/` — 主题 |
| 切换表格语言 | `09-localization/` |
| 定义表格之间的权限 | `06-advanced/` — Ingress/Egress |
| 自定义键盘快捷键 | `06-advanced/` — Keyboard Shortcuts, `10-examples/#10` |
| 右键上下文菜单 | `04-components/`, `10-examples/#11` |
| 导出 CSV/Excel | `08-patterns/` — Export |
| 层级树形数据 | `06-advanced/` — Tree Data |
| 自定义布局（header/footer） | `07-configuration/` — FiboGridConfigs |
| 完整的 TypeScript 类型 | `02-types/` |
| 所有可用的 hooks | `03-hooks/` |

---

## 导入路径

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

## 推荐的使用结构

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

### 分离示例

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

## 完整文档目录树

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
