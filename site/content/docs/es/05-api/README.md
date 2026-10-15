# 05 - Grid API

## Ubicación

```
src/components/FiboGrid/types.ts          # Interfaces
src/components/FiboGrid/hooks/grid-state/useGridApi.ts  # Implementacao
```

## Índice

| Archivo | Contenido |
|----------|----------|
| [README.md](./README.md) | GridApi, GridApiBuilder, GridManagerBuilder, EventBuilder |
| [utils.md](./utils.md) | helpers, grouping, shortcuts, excelExport, permissionValidator, CSS |

---

## GridApi<T>

API pública principal del grid. Accesible vía `onGridReady`, `useFiboGrid` o `useGridState`.

```typescript
// Via onGridReady
<FiboGrid onGridReady={(e) => { apiRef.current = e.api; }} />

// Via useFiboGrid (fora da arvore)
const { grid } = useFiboGrid<MeuTipo>('meu-grid');
grid.getSelectedRows();
```

---

## Métodos de datos

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

## Métodos de selección

```typescript
api.selectAll(): void;
api.deselectAll(): void;
api.selectRow(id: string, selected?: boolean): void;
api.selectRows(ids: string[], selected?: boolean): void;
api.getSelectedRows(): RowNode<T>[];
api.getSelectedNodes(): RowNode<T>[];
```

---

## Métodos de ordenación

```typescript
api.setSortModel(model: SortModel[]): void;
api.getSortModel(): SortModel[];
```

---

## Métodos de filtrado

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

## Métodos de columnas

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

## Métodos de paginación

```typescript
api.setPage(page: number): void;
api.setPageSize(size: number): void;
api.nextPage(): void;
api.previousPage(): void;
```

---

## Métodos de edición

```typescript
api.startEditingCell(rowId: string, field: string): void;
api.stopEditing(cancel?: boolean): void;
api.undo(): void;
```

---

## Métodos de scroll

```typescript
api.ensureRowVisible(id: string): void;
api.ensureColumnVisible(field: string): void;
api.scrollTo({ top?: number, left?: number }): void;
```

---

## Métodos de export

```typescript
api.exportToCsv(params?: ExportParams): void;
api.copyToClipboard(includeHeaders?: boolean): Promise<void>;
api.pasteFromClipboard(): Promise<void>;
```

---

## Métodos de refresh

```typescript
api.refreshCells(): void;
api.redrawRows(): void;
api.refresh(): void;
api.refreshSelection(): void;
```

---

## Métodos de eventos

```typescript
api.addEventListener(eventType: string, listener: (event: any) => void): void;
api.removeEventListener(eventType: string, listener: (event: any) => void): void;
api.events(): EventBuilder<T>;
```

---

## Métodos de conexión

```typescript
api.connect(sourceId: string): GridApi<T>;
```

Devuelve una versión de la API con permisos validados vía Ingress/Egress.

---

## GridApiBuilder<T> (API fluida)

Encadena operaciones y las ejecuta de forma atómica mediante `execute()`.

```typescript
api.params()
  .setFilterModel([{ field: 'status', filterType: 'text', value: 'ativo', operator: 'equals' }])
  .setSortModel([{ field: 'nome', direction: 'asc' }])
  .setPage(0)
  .selectRows(['id1', 'id2'])
  .execute();
```

### Métodos disponibles

| Método | Descripción |
|--------|-----------|
| `setFilterModel(model, options?)` | Definir filtros |
| `removeFilter(field)` | Eliminar el filtro de un campo |
| `removeAllFilter()` | Eliminar todos los filtros |
| `setQuickFilter(text)` | Definir filtro rápido |
| `removeQuickFilter()` | Eliminar filtro rápido |
| `setSortModel(model)` | Definir ordenación |
| `removeSort(field)` | Eliminar el sort de un campo |
| `removeAllSort()` | Eliminar toda la ordenación |
| `setPage(page)` | Ir a una página |
| `setPageSize(size)` | Definir el tamaño de página |
| `setPagination(state)` | Definir estado parcial de paginación |
| `selectRow(id, selected?)` | Seleccionar/deseleccionar fila |
| `selectRows(ids, selected?)` | Seleccionar/deseleccionar varias filas |
| `selectAll()` | Seleccionar todo |
| `deselectAll()` | Deseleccionar todo |
| `updateRowData(updates)` | Add/update/remove de datos |
| `resetState()` | Reset del estado completo |
| `resetEdits()` | Reset de ediciones |
| `resetCell(rowId, field)` | Reset de una celda específica |
| `resetRow(rowId)` | Reset de una fila específica |
| `gridManager(callback)` | Acceso al Manager dentro del builder |
| `execute()` | Ejecutar todas las operaciones |

---

## GridManagerBuilder<T> (CRUD avanzado)

Gestión avanzada de datos con operaciones encadenadas.

```typescript
api.manager()
  .add([{ id: 3, nome: 'Pedro' }])
  .update([{ id: 1, nome: 'João Atualizado' }])
  .remove(['2'])
  .execute();
```

### Métodos disponibles

| Método | Descripción |
|--------|-----------|
| `add(rows)` | Añadir filas al final |
| `upAdd(rows)` | Añadir filas al principio |
| `key(keyName)` | Definir el campo clave para el merge |
| `mergeUnique(enable?)` | Merge único basado en la clave |
| `replaceAll(rows, compareKey?)` | Reemplazar todos los datos |
| `remove(rowIds)` | Eliminar filas por ID |
| `update(rows)` | Actualizar filas existentes |
| `updateCell(rowId, field, value)` | Actualizar una celda específica |
| `resetCell(rowId, field)` | Reset de celda |
| `resetRow(rowId)` | Reset de fila |
| `reset()` | Limpiar todos los datos |
| `resetEdits()` | Deshacer todas las ediciones |
| `setSelectionData(data)` | Definir datos en las filas seleccionadas |
| `split(rowId, options?)` | Dividir fila (con opción de hijo) |
| `execute()` | Ejecutar todas las operaciones |

---

## EventBuilder<T>

Sistema de suscripción a eventos con API fluida.

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

### Suscripciones especializadas

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

Registrar handlers directos (similar a las props de evento).

```typescript
api.events().calls().onSelectionChanged = (event) => { ... };
api.events().calls().onSortChanged = (event) => { ... };
```

### DiffSubscription

Sigue los cambios con acceso al valor antiguo y al nuevo.

```typescript
events.onSortChanged().getSortModel().old().listen(handler);    // valor anterior
events.onSortChanged().getSortModel().actual().listen(handler); // valor atual
events.onSortChanged().getSortModel().all().listen(handler);    // { old, actual }
events.onSortChanged().getSortModel().visual().listen(handler); // formatado
```
