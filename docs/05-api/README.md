# 05 - Grid API

## Localizacao

```
src/components/FiboGrid/types.ts          # Interfaces
src/components/FiboGrid/hooks/grid-state/useGridApi.ts  # Implementacao
```

## Indice

| Ficheiro | Conteudo |
|----------|----------|
| [README.md](./README.md) | GridApi, GridApiBuilder, GridManagerBuilder, EventBuilder |
| [utils.md](./utils.md) | helpers, grouping, shortcuts, excelExport, permissionValidator, CSS |

---

## GridApi<T>

API publica principal do grid. Acessivel via `onGridReady`, `useFiboGrid` ou `useGridState`.

```typescript
// Via onGridReady
<FiboGrid onGridReady={(e) => { apiRef.current = e.api; }} />

// Via useFiboGrid (fora da arvore)
const { grid } = useFiboGrid<MeuTipo>('meu-grid');
grid.getSelectedRows();
```

---

## Metodos de Dados

```typescript
// Obter dados
api.getRowData(): T[];
api.getDisplayedRows(): RowNode<T>[];
api.getRowNode(id: string): RowNode<T> | null;
api.getDisplayedRowCount(): number;
api.getDisplayedRowAtIndex(index: number): RowNode<T> | null;
api.forEachNode((node: RowNode<T>) => void): void;

// Modificar dados
api.setRowData(data: T[]): void;
api.updateRowData({ add?: T[], update?: T[], remove?: T[] }): void;
api.addChildToRow(parentId: string, data: T[]): void;
```

---

## Metodos de Selecao

```typescript
api.selectAll(): void;
api.deselectAll(): void;
api.selectRow(id: string, selected?: boolean): void;
api.selectRows(ids: string[], selected?: boolean): void;
api.getSelectedRows(): RowNode<T>[];
api.getSelectedNodes(): RowNode<T>[];
```

---

## Metodos de Ordenacao

```typescript
api.setSortModel(model: SortModel[]): void;
api.getSortModel(): SortModel[];
```

---

## Metodos de Filtragem

```typescript
api.setFilterModel(model: FilterModel[], options?: SetFilterOptions): void;
api.getFilterModel(): FilterModel[];
api.setQuickFilter(text: string): void;
```

### SetFilterOptions

```typescript
interface SetFilterOptions {
  behavior?: 'replace' | 'merge';
}
```

---

## Metodos de Colunas

```typescript
api.getColumnDefs(): ColumnDef<T>[];
api.setColumnVisible(field: string, visible: boolean): void;
api.setColumnPinned(field: string, pinned: 'left' | 'right' | null): void;
api.moveColumn(fromIndex: number, toIndex: number): void;
api.resizeColumn(field: string, width: number): void;
api.autoSizeColumn(field: string): void;
api.autoSizeAllColumns(): void;
```

---

## Metodos de Paginacao

```typescript
api.setPage(page: number): void;
api.setPageSize(size: number): void;
api.nextPage(): void;
api.previousPage(): void;
```

---

## Metodos de Edicao

```typescript
api.startEditingCell(rowId: string, field: string): void;
api.stopEditing(cancel?: boolean): void;
api.undo(): void;
```

---

## Metodos de Scroll

```typescript
api.ensureRowVisible(id: string): void;
api.ensureColumnVisible(field: string): void;
api.scrollTo({ top?: number, left?: number }): void;
```

---

## Metodos de Export

```typescript
api.exportToCsv(params?: ExportParams): void;
api.copyToClipboard(includeHeaders?: boolean): Promise<void>;
api.pasteFromClipboard(): Promise<void>;
```

---

## Metodos de Refresh

```typescript
api.refreshCells(): void;
api.redrawRows(): void;
api.refresh(): void;
api.refreshSelection(): void;
```

---

## Metodos de Eventos

```typescript
api.addEventListener(eventType: string, listener: (event: any) => void): void;
api.removeEventListener(eventType: string, listener: (event: any) => void): void;
api.events(): EventBuilder<T>;
```

---

## Metodos de Conexao

```typescript
api.connect(sourceId: string): GridApi<T>;
```

Retorna uma versao do API com permissoes validadas via Ingress/Egress.

---

## GridApiBuilder<T> (API Fluente)

Encadear operacoes e executar atomicamente via `execute()`.

```typescript
api.params()
  .setFilterModel([{ field: 'status', filterType: 'text', value: 'ativo', operator: 'equals' }])
  .setSortModel([{ field: 'nome', direction: 'asc' }])
  .setPage(0)
  .selectRows(['id1', 'id2'])
  .execute();
```

### Metodos Disponiveis

| Metodo | Descricao |
|--------|-----------|
| `setFilterModel(model, options?)` | Definir filtros |
| `removeFilter(field)` | Remover filtro de um campo |
| `removeAllFilter()` | Remover todos os filtros |
| `setQuickFilter(text)` | Definir filtro rapido |
| `removeQuickFilter()` | Remover filtro rapido |
| `setSortModel(model)` | Definir ordenacao |
| `removeSort(field)` | Remover sort de um campo |
| `removeAllSort()` | Remover toda ordenacao |
| `setPage(page)` | Ir para pagina |
| `setPageSize(size)` | Definir tamanho da pagina |
| `setPagination(state)` | Definir estado parcial de paginacao |
| `selectRow(id, selected?)` | Selecionar/deselecionar linha |
| `selectRows(ids, selected?)` | Selecionar/deselecionar multiplas linhas |
| `selectAll()` | Selecionar tudo |
| `deselectAll()` | Deselecionar tudo |
| `updateRowData(updates)` | Add/update/remove dados |
| `resetState()` | Reset do estado completo |
| `resetEdits()` | Reset de edicoes |
| `resetCell(rowId, field)` | Reset de celula especifica |
| `resetRow(rowId)` | Reset de linha especifica |
| `gridManager(callback)` | Acesso ao Manager dentro do builder |
| `execute()` | Executar todas as operacoes |

---

## GridManagerBuilder<T> (CRUD Avancado)

Gestao avancada de dados com operacoes encadeadas.

```typescript
api.manager()
  .add([{ id: 3, nome: 'Pedro' }])
  .update([{ id: 1, nome: 'João Atualizado' }])
  .remove(['2'])
  .execute();
```

### Metodos Disponiveis

| Metodo | Descricao |
|--------|-----------|
| `add(rows)` | Adicionar linhas ao final |
| `upAdd(rows)` | Adicionar linhas no topo |
| `key(keyName)` | Definir campo de chave para merge |
| `mergeUnique(enable?)` | Merge unico baseado na chave |
| `replaceAll(rows, compareKey?)` | Substituir todos os dados |
| `remove(rowIds)` | Remover linhas por ID |
| `update(rows)` | Atualizar linhas existentes |
| `updateCell(rowId, field, value)` | Atualizar celula especifica |
| `resetCell(rowId, field)` | Reset de celula |
| `resetRow(rowId)` | Reset de linha |
| `reset()` | Limpar todos os dados |
| `resetEdits()` | Desfazer todas as edicoes |
| `setSelectionData(data)` | Definir dados nas linhas selecionadas |
| `split(rowId, options?)` | Dividir linha (com opcao de filho) |
| `execute()` | Executar todas as operacoes |

---

## EventBuilder<T>

Sistema de subscricao de eventos com API fluente.

```typescript
const events = api.events();

// Subscrever com listen
const unsubscribe = events.onSelectionChanged().listen((event) => {
  console.log(event.selectedRows);
});

// Subscrever uma vez
events.onRowClicked().once((event) => {
  console.log('Primeiro click:', event.rowNode.data);
});

// Cancelar subscricao
events.onFilterChanged().off(handler);

// Usar em render (hook)
const selectedCount = useEventValue(events.onSelectionChanged().getCount(), 0);
```

### Subscricoes Especializadas

#### SelectionChangedSubscription

```typescript
events.onSelectionChanged().getRowData().listen(handler);
events.onSelectionChanged().getAllData().listen(handler);
events.onSelectionChanged().getIds().listen(handler);
events.onSelectionChanged().getCount().listen(handler);
events.onSelectionChanged().getFirstRow().listen(handler);
```

#### SortChangedSubscription

```typescript
events.onSortChanged().getSortModel().listen(handler);
events.onSortChanged().getFirstSort().listen(handler);
// DiffSubscription: .old(), .actual(), .all()
```

#### FilterChangedSubscription

```typescript
events.onFilterChanged().getFilterModel().listen(handler);
events.onFilterChanged().getFilterCount().listen(handler);
```

#### PaginationChangedSubscription

```typescript
events.onPaginationChanged().getCurrentPage().listen(handler);
events.onPaginationChanged().getPageSize().listen(handler);
events.onPaginationChanged().getTotalPages().listen(handler);
events.onPaginationChanged().getIsFirstPage().listen(handler);
events.onPaginationChanged().getIsLastPage().listen(handler);
events.onPaginationChanged().getNextPage().listen(handler);
events.onPaginationChanged().getPrevPage().listen(handler);
```

#### CellValueChangedSubscription

```typescript
events.onCellValueChanged().getNewValue().listen(handler);
events.onCellValueChanged().getOldValue().listen(handler);
events.onCellValueChanged().getField().listen(handler);
```

### EventBuilder.calls()

Registar handlers diretos (similar a props de evento).

```typescript
api.events().calls().onSelectionChanged = (event) => { ... };
api.events().calls().onSortChanged = (event) => { ... };
```

### DiffSubscription

Acompanha mudancas com acesso ao valor antigo e novo.

```typescript
events.onSortChanged().getSortModel().old().listen(handler);    // valor anterior
events.onSortChanged().getSortModel().actual().listen(handler); // valor atual
events.onSortChanged().getSortModel().all().listen(handler);    // { old, actual }
events.onSortChanged().getSortModel().visual().listen(handler); // formatado
```
