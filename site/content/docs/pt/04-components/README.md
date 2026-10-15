# 04 - Componentes

## Localizacao

```
src/components/FiboGrid/components/
```

## Indice

| Ficheiro | Conteudo |
|----------|----------|
| [README.md](./README.md) | FiboGrid, GridToolbar, GridStatusBar, ColumnMenu, GroupRow, ColumnPanel, FilterPanel |
| [special-renderers.md](./special-renderers.md) | RowNumberRenderer, CheckboxCellRenderer, CheckboxHeaderRenderer, GridContext |

---

## FiboGrid<T>

Componente principal. Recebe dados, colunas e configuracoes.

```tsx
import { FiboGrid } from 'fibogrid';

<FiboGrid<MeuTipo>
  rowData={dados}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
  pagination
  paginationPageSize={20}
  rowSelection="multiple"
  showToolbar
  showStatusBar
  theme="light"
  onGridReady={(e) => console.log('Grid pronto:', e.api)}
/>
```

### Props Principais

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `rowData` | `T[]` | obrigatorio | Array de dados |
| `columnDefs` | `ColumnDef<T>[]` | obrigatorio | Definicoes de colunas |
| `getRowId` | `(data: T) => string` | auto | Funcao para ID unico da linha |
| `gridId` | `string` | auto | ID para registro no GridRegistry |
| `pagination` | `boolean` | `false` | Ativar paginacao |
| `paginationPageSize` | `number` | `10` | Itens por pagina |
| `paginationPageSizeOptions` | `number[]` | `[10,20,50]` | Opcoes de tamanho |
| `paginationMode` | `'client' \| 'server'` | `'client'` | Modo de paginacao |
| `serverSideDataSource` | `ServerSideDataSource<T>` | — | Data source para server-side |
| `rowSelection` | `'single' \| 'multiple'` | — | Tipo de selecao |
| `rangeCellSelection` | `boolean` | `false` | Selecao Excel-style |
| `rowDragEnabled` | `boolean` | `false` | Drag de linhas |
| `defaultColDef` | `Partial<ColumnDef<T>>` | — | Defaults para todas as colunas |
| `rowHeight` | `number` | `40` | Altura da linha em px |
| `headerHeight` | `number` | `44` | Altura do cabecalho |
| `height` | `number \| string` | — | Altura do grid |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Tema |
| `loading` | `boolean` | `false` | Mostrar overlay de loading |
| `quickFilterText` | `string` | — | Texto de filtro rapido |
| `showToolbar` | `boolean` | `false` | Mostrar toolbar |
| `showStatusBar` | `boolean` | `false` | Mostrar status bar |
| `contextMenu` | `boolean` | `false` | Menu de contexto (right-click) |
| `groupByFields` | `string[]` | — | Campos para agrupar |
| `groupAggregations` | `Record<string, AggFunc>` | — | Agregacoes por campo |
| `treeData` | `boolean` | `false` | Dados hierarquicos |
| `lang` | `FiboGridLocale` | `enUS` | Idioma |
| `shortcuts` | `boolean \| ShortcutDef[]` | `false` | Atalhos de teclado |
| `configs` | `FiboGridConfigs` | — | Configuracao avancada de layout |
| `egress` | `GridEgress[]` | — | Permissoes de saida |
| `ingress` | `GridIngress[]` | — | Permissoes de entrada |

### Props de Eventos

| Prop | Tipo |
|------|------|
| `onGridReady` | `(event: GridReadyEvent<T>) => void` |
| `onSelectionChanged` | `(event: SelectionChangedEvent<T>) => void` |
| `onRowClicked` | `(event: RowClickedEvent<T>) => void` |
| `onRowDoubleClicked` | `(event: RowDoubleClickedEvent<T>) => void` |
| `onRowClickFallback` | `(event: RowClickFallbackEvent<T>) => void` |
| `onCellClicked` | `(event: CellClickedEvent<T>) => void` |
| `onCellDoubleClicked` | `(event: CellDoubleClickedEvent<T>) => void` |
| `onCellValueChanged` | `(event: CellValueChangedEvent<T>) => void` |
| `onSortChanged` | `(event: SortChangedEvent) => void` |
| `onFilterChanged` | `(event: FilterChangedEvent) => void` |
| `onPaginationChanged` | `(event: PaginationChangedEvent) => void` |
| `onColumnResized` | `(event: ColumnResizedEvent<T>) => void` |
| `onColumnMoved` | `(event: ColumnMovedEvent<T>) => void` |
| `onRowDragStart` | `(event: RowDragEvent<T>) => void` |
| `onRowDragEnd` | `(event: RowDragEvent<T>) => void` |
| `onRowDragMove` | `(event: RowDragEvent<T>) => void` |
| `onGlobalFilterChange` | `(event: GlobalFilterChangedEvent<T>) => void` |
| `onFilterRemoved` | `(event: FilterRemovedEvent<T>) => void` |

---

## GridToolbar

Barra de ferramentas com search, filtros, export e gestao de colunas.

```tsx
import { GridToolbar } from 'fibogrid';

<GridToolbar
  api={gridApi}
  columns={columns}
  filterModel={filterModel}
  quickFilter={quickFilter}
  onQuickFilterChange={setQuickFilter}
  configs={configs.header}
  lang={lang}
/>
```

### Funcionalidades

- Pesquisa rapida (quick filter)
- Botao de filtros com contador de filtros ativos
- Toggle de colunas (show/hide)
- Botao de export (CSV/Excel)
- Botao de copiar para clipboard
- Toggle de densidade (compact/normal/comfortable)
- Acoes customizadas via `configs.header.customActions`

---

## GridStatusBar

Barra de status no rodape com informacoes agregadas.

```tsx
import { GridStatusBar } from 'fibogrid';

<GridStatusBar
  displayedRowCount={100}
  totalRowCount={500}
  selectedCount={5}
  aggregations={aggregations}
  lang={lang}
/>
```

### Informacoes Exibidas

- Total de linhas
- Linhas selecionadas
- Agregacoes (soma, media, min, max, contagem)

---

## ColumnMenu

Menu de contexto por coluna (click no cabecalho).

```tsx
import { ColumnMenu } from 'fibogrid';
```

### Opcoes

- Ordenar ascendente/descendente
- Fixar coluna (esquerda/direita/nenhum)
- Ajustar largura automaticamente
- Filtrar coluna
- Esconder coluna

---

## GroupRow

Linha de grupo quando `groupByFields` esta ativo.

```tsx
import { GroupRow } from 'fibogrid';
```

### Funcionalidades

- Expandir/colapsar grupo
- Exibir contagem de filhos
- Mostrar valores de agregacao

---

## ColumnPanel

Painel lateral para gestao de visibilidade e ordem de colunas.

```tsx
import { ColumnPanel } from 'fibogrid';
```

---

## FilterPanel

Painel de filtros avancados com suporte a multiplas condicoes.

```tsx
import { FilterPanel } from 'fibogrid';
```

### Tipos de Filtro Suportados

| Tipo | Operadores |
|------|-----------|
| `text` | contains, equals, startsWith, endsWith |
| `number` | equals, greaterThan, lessThan, between |
| `date` | equals, after, before, between |
| `select` | selecao multipla de valores |
| `boolean` | true / false |

---

## Componentes Internos

| Componente | Descricao |
|------------|-----------|
| `GridHeader` | Cabecalhos com indicadores de sort e resize handles |
| `GridRow` | Linha com selecao, hover, drag, classe customizada |
| `GridCell` | Celula com renderer, editor, formatacao |
| `GridFooter` | Container do rodape |
| `GridPagination` | Controles de navegacao de pagina |
| `GridOverlay` | Overlay de loading e "sem dados" |
| `ContextMenu` | Menu right-click com sub-menus |
| `FilterPopover` | Popover de selecao de valores de filtro |
| `VirtualFilterList` | Lista virtualizada de valores no filtro |
| `SpecialRenderers` | Renderers built-in (checkbox, rowNumber, action) |
