# 03 - Hooks

## Localizacao

```
src/components/FiboGrid/hooks/
```

---

## useFiboGrid (hook principal — acesso externo)

Hook para acessar o grid de qualquer componente fora da arvore do FiboGrid. Requer `GridRegistryProvider`.

```typescript
import { useFiboGrid } from 'fibogrid';

const { grid, events, registry } = useFiboGrid<MeuTipo>('meu-grid-id');

// Acessar dados
const rows = grid.getSelectedRows();

// Ouvir eventos
events.onSelectionChanged().listen((event) => {
  console.log('Selecao mudou:', event.selectedRows);
});

// Acessar outro grid
const outroGrid = registry.getGridApi('outro-grid');
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `gridId` | `string` | ID do grid registrado no GridRegistry |

### Retorno (`UseFiboGridReturn<T>`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `grid` | `GridApi<T>` | API completa do grid |
| `events` | `EventBuilder<T>` | Builder de subscricoes de eventos |
| `registry` | `GridRegistryContextValue<T>` | Acesso ao registro de grids |

---

## useGridState

Orquestrador central de estado. Combina todos os sub-hooks internos.

```typescript
import { useGridState } from 'fibogrid';

const state = useGridState<MeuTipo>(props, containerWidth);
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `props` | `FiboGridProps<T>` | Props do componente FiboGrid |
| `containerWidth` | `number` | Largura do container em px |

### Retorno (completo)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Todas as linhas (antes de sort/filter) |
| `allRows` | `RowNode<T>[]` | Alias de rows |
| `displayedRows` | `RowNode<T>[]` | Linhas apos sort/filter/pagina |
| `finalDisplayedRows` | `RowNode<T>[]` | Linhas finais (com agrupamento) |
| `columns` | `ColumnDef<T>[]` | Colunas originais |
| `sortModel` | `SortModel[]` | Modelo de ordenacao |
| `setSortModel` | `(model: SortModel[]) => void` | Atualizar sort |
| `filterModel` | `FilterModel[]` | Modelo de filtros |
| `setFilterModel` | `(model: FilterModel[], opts?) => void` | Atualizar filtros |
| `quickFilter` | `string` | Texto de filtro rapido |
| `setQuickFilter` | `(text: string) => void` | Atualizar filtro rapido |
| `selection` | `SelectionState` | Estado de selecao |
| `selectRow` | `(id, selected?) => void` | Selecionar linha |
| `selectAll` | `() => void` | Selecionar tudo |
| `deselectAll` | `() => void` | Deselecionar tudo |
| `paginationState` | `PaginationState` | Estado de paginacao |
| `setPaginationState` | `(state) => void` | Atualizar paginacao |
| `editingCell` | `EditingCell \| null` | Celula em edicao |
| `setEditingCell` | `(cell) => void` | Definir celula em edicao |
| `api` | `GridApi<T>` | API publica (com seguranca) |
| `internalApi` | `GridApi<T>` | API interna (sem seguranca) |
| `setColumnOrder` | `(order: string[]) => void` | Reordenar colunas |
| `setColumnWidths` | `(widths: Record<string, number>) => void` | Redimensionar colunas |
| `setColumnPinned` | `(field, pinned) => void` | Fixar coluna |
| `serverSideLoading` | `boolean` | Loading do server-side |
| `hasCustomRowNumber` | `boolean` | Tem coluna rowNumber customizada |
| `hasCustomCheckbox` | `boolean` | Tem coluna checkbox customizada |
| `fireEvent` | `(type, data) => void` | Disparar evento manualmente |
| `grouping` | `UseGroupingResult<T>` | Estado de agrupamento |

---

## useVirtualization

Virtual scrolling para grandes datasets. Renderiza apenas linhas visiveis no viewport.

```typescript
import { useVirtualization } from 'fibogrid';

const result = useVirtualization<MeuTipo>(rows, options);
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Linhas a virtualizar |
| `options` | `VirtualizationOptions` | Configuracao |

### VirtualizationOptions

| Campo | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `rowHeight` | `number` | `40` | Altura de cada linha em px |
| `overscan` | `number` | `5` | Linhas extra renderizadas acima/abaixo |
| `containerHeight` | `number` | — | Altura do viewport |

### Retorno (`VirtualizationResult<T>`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `virtualRows` | `RowNode<T>[]` | Apenas linhas visiveis (+ overscan) |
| `totalHeight` | `number` | Altura total do scroll (todas as linhas) |
| `offsetTop` | `number` | Offset Y para posicionar as linhas |
| `startIndex` | `number` | Indice da primeira linha visivel |
| `endIndex` | `number` | Indice da ultima linha visivel |
| `scrollTop` | `number` | Posicao atual do scroll |
| `handleScroll` | `(event) => void` | Handler do evento de scroll |
| `scrollToRow` | `(index: number) => void` | Scrollar ate uma linha |
| `containerRef` | `RefObject<HTMLDivElement>` | Ref do container |

---

## useColumnResize

Controla redimensionamento de colunas via drag no separador do header.

```typescript
import { useColumnResize } from 'fibogrid';

const result = useColumnResize(onResize);
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `onResize` | `(field: string, width: number) => void` | Callback de resize |

### Retorno (`ColumnResizeResult`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `isResizing` | `boolean` | Resize em andamento |
| `resizingColumn` | `string \| null` | Campo da coluna sendo redimensionada |
| `handleResizeStart` | `(field, startX, startWidth) => void` | Iniciar resize |
| `handleResizeDoubleClick` | `(field) => void` | Auto-size ao double-click |

---

## useColumnDrag

Drag-and-drop para reordenacao de colunas.

```typescript
import { useColumnDrag } from 'fibogrid';

const result = useColumnDrag(onColumnMove);
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `onColumnMove` | `(fromIndex: number, toIndex: number) => void` | Callback de move |

### Retorno (`ColumnDragResult`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `isDragging` | `boolean` | Drag em andamento |
| `draggedColumn` | `string \| null` | Campo da coluna sendo arrastada |
| `dragOverColumn` | `string \| null` | Campo da coluna sob o cursor |
| `handleDragStart` | `(field, index) => void` | Iniciar drag |
| `handleDragOver` | `(field, index) => void` | Cursor sobre coluna |
| `handleDragEnd` | `() => void` | Finalizar drag |
| `handleDrop` | `(targetIndex) => void` | Soltar coluna |

---

## useRowDrag

Drag-and-drop de linhas para reordenacao.

```typescript
import { useRowDrag } from 'fibogrid';

const result = useRowDrag(onRowMove, onDragStart, onDragEnd, onDragMove);
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `onRowMove` | `(fromIndex, toIndex) => void` | Callback de move |
| `onDragStart` | `(event: RowDragEvent<T>) => void` | Opcional: inicio do drag |
| `onDragEnd` | `(event: RowDragEvent<T>) => void` | Opcional: fim do drag |
| `onDragMove` | `(event: RowDragEvent<T>) => void` | Opcional: durante o drag |

### Retorno (`RowDragResult<T>`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `isDragging` | `boolean` | Drag em andamento |
| `draggedRow` | `RowNode<T> \| null` | Linha sendo arrastada |
| `dropTargetRow` | `RowNode<T> \| null` | Linha alvo do drop |
| `dropPosition` | `'above' \| 'below' \| null` | Posicao relativa do drop |
| `handleDragStart` | `(row, event) => void` | Iniciar drag |
| `handleDragOver` | `(row, event) => void` | Cursor sobre linha |
| `handleDrop` | `(event) => void` | Soltar linha |
| `handleDragEnd` | `() => void` | Finalizar drag |

---

## useRangeSelection

Selecao de range de celulas estilo Excel (click + arrastar).

```typescript
const result = useRangeSelection<MeuTipo>();
```

### Retorno (`RangeSelectionResult`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `isSelecting` | `boolean` | Selecao em andamento |
| `selectionStart` | `{rowId, field} \| null` | Celula inicio |
| `selectionEnd` | `{rowId, field} \| null` | Celula fim |
| `selectedCells` | `Set<string>` | Celulas selecionadas (formato "rowId:field") |
| `handleCellMouseDown` | `(rowId, field, event) => void` | Mouse down na celula |
| `handleCellMouseEnter` | `(rowId, field) => void` | Mouse enter na celula |
| `handleMouseUp` | `() => void` | Mouse up (finalizar selecao) |
| `clearSelection` | `() => void` | Limpar selecao |
| `isCellSelected` | `(rowId, field) => boolean` | Verificar se celula esta selecionada |

---

## useRowRangeSelection

Selecao de range de linhas (Shift+Click para selecionar multiplas).

```typescript
const result = useRowRangeSelection<MeuTipo>();
```

### Retorno (`RowRangeSelectionResult`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `isDraggingRows` | `boolean` | Selecao de range em andamento |
| `handleRowMouseDown` | `(rowIndex, event) => void` | Mouse down na linha |
| `handleRowMouseEnter` | `(rowIndex) => void` | Mouse enter na linha |
| `handleRowMouseUp` | `() => void` | Mouse up (finalizar) |

---

## useKeyboardNavigation

Navegacao por teclado com suporte a atalhos customizados.

```typescript
const result = useKeyboardNavigation<MeuTipo>(props);
```

### Parametros (`UseKeyboardNavigationProps<T>`)

| Param | Tipo | Descricao |
|-------|------|-----------|
| `containerRef` | `RefObject<HTMLDivElement>` | Ref do container do grid |
| `displayedRows` | `RowNode<T>[]` | Linhas exibidas |
| `columns` | `ProcessedColumn<T>[]` | Colunas processadas |
| `api` | `GridApi<T>` | API do grid |
| `onStartEdit` | `(rowId, field) => void` | Callback para iniciar edicao |
| `onStopEdit` | `(cancel?) => void` | Callback para parar edicao |
| `isEditing` | `boolean` | Se esta em modo edicao |
| `shortcuts` | `boolean \| ShortcutDef<T>[]` | Atalhos customizados |

### Retorno

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `focusedCell` | `{rowId, field} \| null` | Celula com foco |
| `focusCell` | `(rowIndex, colIndex) => void` | Focar celula por indices |
| `isCellFocused` | `(rowId, field) => boolean` | Verificar foco |
| `setFocusedCell` | `(cell) => void` | Definir foco manualmente |
| `handleKeyDown` | `(event) => void` | Handler de teclado |

---

## useCellSelection

Selecao individual de celulas com suporte a fill handle.

```typescript
const result = useCellSelection<MeuTipo>(rows, columns);
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Linhas exibidas |
| `columns` | `ProcessedColumn<T>[]` | Colunas processadas |

### Retorno (`UseCellSelectionResult`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `selectedRange` | `{start, end} \| null` | Range selecionado |
| `isSelecting` | `boolean` | Selecao em andamento |
| `isCellSelected` | `(rowId, field) => boolean` | Celula esta selecionada |
| `handleCellMouseDown` | `(rowId, field, event) => void` | Mouse down |
| `handleCellMouseEnter` | `(rowId, field) => void` | Mouse enter |
| `handleMouseUp` | `() => void` | Mouse up |
| `clearSelection` | `() => void` | Limpar |
| `getSelectedCells` | `() => {rowId, field, value}[]` | Obter celulas selecionadas |
| `fillHandlePosition` | `{rowId, field} \| null` | Posicao do fill handle |
| `isFillHandleDragging` | `boolean` | Fill handle sendo arrastado |
| `fillRange` | `{start, end} \| null` | Range do fill |

---

## useFillHandle

Fill handle para estender valores (arrastar canto inferior direito da selecao).

```typescript
const result = useFillHandle<MeuTipo>(options);
```

### Parametros (`UseFillHandleOptions<T>`)

| Param | Tipo | Descricao |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Linhas exibidas |
| `columns` | `ProcessedColumn<T>[]` | Colunas processadas |
| `onFill` | `(source, target) => void` | Callback de preenchimento |

### Retorno (`UseFillHandleResult`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `fillRange` | `{start, end} \| null` | Range de preenchimento |
| `isFilling` | `boolean` | Preenchimento em andamento |
| `handleFillStart` | `(rowId, field) => void` | Iniciar fill |
| `handleFillMove` | `(rowId, field) => void` | Mover fill |
| `handleFillEnd` | `() => void` | Finalizar fill |
| `getFillHandlePosition` | `() => {x, y} \| null` | Posicao visual do handle |

---

## useUndoRedo

Sistema de desfazer/refazer com historico configuravel.

```typescript
const result = useUndoRedo<MeuTipo>({ maxHistory: 50 });
```

### Parametros (`UseUndoRedoOptions<T>`)

| Param | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `maxHistory` | `number` | `50` | Maximo de operacoes no historico |

### Retorno (`UseUndoRedoResult<T>`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `recordChange` | `(change) => void` | Registar mudanca no historico |
| `undo` | `() => Change \| undefined` | Desfazer ultima mudanca |
| `redo` | `() => Change \| undefined` | Refazer mudanca desfeita |
| `canUndo` | `boolean` | Tem operacoes para desfazer |
| `canRedo` | `boolean` | Tem operacoes para refazer |
| `clearHistory` | `() => void` | Limpar historico completo |

---

## useGrouping

Agrupamento de linhas por campos com agregacoes e expansao.

```typescript
const result = useGrouping<MeuTipo>(options);
```

### Parametros (`UseGroupingOptions<T>`)

| Param | Tipo | Descricao |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Linhas a agrupar |
| `groupByFields` | `string[]` | Campos para agrupar |
| `splitByField` | `string` | Campo para dividir |
| `aggregations` | `Record<string, AggFunc>` | Funcoes de agregacao |
| `getRowId` | `(data: T) => string` | Funcao de ID |
| `overrides` | `Record<string, any>` | Overrides de valores |

### Retorno (`UseGroupingResult<T>`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `displayRows` | `GroupableRowNode<T>[]` | Linhas prontas para exibicao (com grupos) |
| `groupedRows` | `GroupableRowNode<T>[]` | Linhas agrupadas (hierarquia) |
| `expandedGroups` | `Set<string>` | IDs de grupos expandidos |
| `toggleGroupExpand` | `(groupId: string) => void` | Expandir/colapsar grupo |
| `expandAllGroups` | `() => void` | Expandir todos os grupos |
| `collapseAllGroups` | `() => void` | Colapsar todos os grupos |
| `setGroupByFields` | `(fields: string[]) => void` | Mudar campos de agrupamento |
| `isGroupRow` | `(node) => boolean` | Verificar se e linha de grupo |
| `addChildToRow` | `(parentId, data) => void` | Adicionar filhos a uma linha |
| `expandedRows` | `Set<string>` | IDs de linhas expandidas (tree) |
| `toggleRowExpand` | `(rowId: string) => void` | Expandir/colapsar linha tree |
| `hasChildren` | `boolean` | Alguma linha tem filhos |

---

## useServerSideData

Carregamento de dados do servidor com estado de loading e erro.

```typescript
const result = useServerSideData<MeuTipo>(enabled, dataSource, request);
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `enabled` | `boolean` | Se o mode server-side esta ativo |
| `dataSource` | `ServerSideDataSource<T>` | Fonte de dados remota |
| `request` | `ServerSideDataSourceRequest` | Request atual (page, sort, filter) |

### Retorno (`ServerSideDataState<T>`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `data` | `T[]` | Dados recebidos do servidor |
| `totalRows` | `number` | Total de linhas no servidor |
| `loading` | `boolean` | Carregamento em andamento |
| `error` | `Error \| null` | Erro do ultimo request |
| `refresh` | `() => void` | Recarregar dados |
| `updateData` | `(data: T[]) => void` | Atualizar dados localmente |

---

## useGridEvents

Cria um EventBuilder para um grid especifico via Registry.

```typescript
import { useGridEvents } from 'fibogrid';

const events = useGridEvents<MeuTipo>('meu-grid-id');
events.onSelectionChanged().listen(handler);
events.onFilterChanged().listen(handler);
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `gridId` | `string` | ID do grid |

### Retorno

`EventBuilder<T>` — ver secao 05-api para detalhes completos.

---

## useGridEvent

Hook declarativo para subscrever a um evento especifico de um grid. Auto-cleanup no unmount.

```typescript
import { useGridEvent } from 'fibogrid';

useGridEvent('meu-grid-id', 'selectionChanged', (event) => {
  console.log('Selecao:', event.selectedRows);
});
```

### Parametros

| Param | Tipo | Descricao |
|-------|------|-----------|
| `gridId` | `string` | ID do grid |
| `eventName` | `string` | Nome do evento |
| `handler` | `(event: any) => void` | Callback do evento |

---

## Hooks Internos (grid-state/)

Hooks usados internamente pelo `useGridState`. Nao exportados diretamente, mas documentados para referencia.

### useGridColumns

Processamento de colunas: flex layout, larguras, pinning, ordenacao, visibilidade.

| Retorno | Tipo | Descricao |
|---------|------|-----------|
| `columnOrder` | `string[]` | Ordem das colunas |
| `setColumnOrder` | `(order) => void` | Reordenar |
| `columnWidths` | `Record<string, number>` | Larguras por campo |
| `setColumnWidths` | `(widths) => void` | Redimensionar |
| `hiddenColumns` | `Set<string>` | Colunas escondidas |
| `setHiddenColumns` | `(hidden) => void` | Esconder/mostrar |
| `pinnedColumns` | `Record<string, 'left'\|'right'>` | Colunas fixas |
| `setPinnedColumns` | `(pinned) => void` | Fixar/desfixar |
| `processedColumns` | `ProcessedColumn<T>[]` | Colunas finais processadas |
| `hasCustomRowNumber` | `boolean` | Coluna rowNumber definida |
| `hasCustomCheckbox` | `boolean` | Coluna checkbox definida |
| `columns` | `ColumnDef<T>[]` | Colunas originais |
| `setColumnPinned` | `(field, pinned) => void` | Fixar coluna |

### useGridRows

Criacao de RowNodes, aplicacao de sort/filter, gestao de overrides e server-side data.

| Retorno | Tipo | Descricao |
|---------|------|-----------|
| `rows` | `RowNode<T>[]` | Todas as linhas |
| `filteredRows` | `RowNode<T>[]` | Apos filtros |
| `sortedRows` | `RowNode<T>[]` | Apos sort |
| `displayedRows` | `RowNode<T>[]` | Apos paginacao |
| `internalRowData` | `T[]` | Dados internos |
| `overrides` | `Record<string, Record<string, any>>` | Overrides de edicao |
| `setOverrides` | `(overrides) => void` | Definir overrides |
| `historyRef` | `RefObject` | Ref do historico undo/redo |
| `serverSideState` | `ServerSideDataState<T>` | Estado server-side |
| `totalRows` | `number` | Total de linhas (pre-paginacao) |

### useGridSelection

Gestao de selecao single/multiple com suporte a Shift e Ctrl.

| Retorno | Tipo | Descricao |
|---------|------|-----------|
| `selection` | `SelectionState` | Estado de selecao |
| `setSelection` | `(state) => void` | Definir selecao |
| `selectionRef` | `RefObject<SelectionState>` | Ref estavel da selecao |
| `selectRow` | `(id, selected?, event?) => void` | Selecionar com Shift/Ctrl |
| `selectRows` | `(ids, selected?) => void` | Selecionar multiplas |
| `selectAll` | `() => void` | Selecionar todas |
| `deselectAll` | `() => void` | Deselecionar todas |

### useGridSortFilter

Sort multi-coluna, filtros compostos e quick filter.

| Retorno | Tipo | Descricao |
|---------|------|-----------|
| `sortModel` | `SortModel[]` | Modelo de sort ativo |
| `setSortModel` | `(model) => void` | Definir sort |
| `filterModel` | `FilterModel[]` | Modelo de filtros ativo |
| `setFilterModel` | `(model, opts?) => void` | Definir filtros |
| `quickFilter` | `string` | Texto de filtro rapido |
| `setQuickFilter` | `(text) => void` | Definir filtro rapido |

### useGridEditing

Edicao inline de celulas com overrides e integracao com undo/redo.

### useGridEventSystem

Pub/sub interno de eventos do grid. Usado para comunicacao entre sub-hooks.

### useGridApi

Montagem da GridApi<T> completa com security proxies (Ingress/Egress validation).

### useClickDetector

Deteccao de tipo de click: single, double, triple, context menu. Usa timer interno para diferenciar clicks consecutivos.
