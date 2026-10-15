# 03 - Hooks

## Ubicación

```
src/components/FiboGrid/hooks/
```

---

## useFiboGrid (hook principal — acceso externo)

Hook para acceder al grid desde cualquier componente fuera del árbol del FiboGrid. Requiere `GridRegistryProvider`.

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

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `gridId` | `string` | ID del grid registrado en el GridRegistry |

### Retorno (`UseFiboGridReturn<T>`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `grid` | `GridApi<T>` | API completa del grid |
| `events` | `EventBuilder<T>` | Builder de suscripciones a eventos |
| `registry` | `GridRegistryContextValue<T>` | Acceso al registro de grids |

---

## useGridState

Orquestador central de estado. Combina todos los sub-hooks internos.

```typescript
import { useGridState } from 'fibogrid';

const state = useGridState<MeuTipo>(props, containerWidth);
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `props` | `FiboGridProps<T>` | Props del componente FiboGrid |
| `containerWidth` | `number` | Ancho del contenedor en px |

### Retorno (completo)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Todas las filas (antes de sort/filter) |
| `allRows` | `RowNode<T>[]` | Alias de rows |
| `displayedRows` | `RowNode<T>[]` | Filas tras sort/filter/página |
| `finalDisplayedRows` | `RowNode<T>[]` | Filas finales (con agrupación) |
| `columns` | `ColumnDef<T>[]` | Columnas originales |
| `sortModel` | `SortModel[]` | Modelo de ordenación |
| `setSortModel` | `(model: SortModel[]) => void` | Actualizar sort |
| `filterModel` | `FilterModel[]` | Modelo de filtros |
| `setFilterModel` | `(model: FilterModel[], opts?) => void` | Actualizar filtros |
| `quickFilter` | `string` | Texto de filtro rápido |
| `setQuickFilter` | `(text: string) => void` | Actualizar filtro rápido |
| `selection` | `SelectionState` | Estado de selección |
| `selectRow` | `(id, selected?) => void` | Seleccionar fila |
| `selectAll` | `() => void` | Seleccionar todo |
| `deselectAll` | `() => void` | Deseleccionar todo |
| `paginationState` | `PaginationState` | Estado de paginación |
| `setPaginationState` | `(state) => void` | Actualizar paginación |
| `editingCell` | `EditingCell \| null` | Celda en edición |
| `setEditingCell` | `(cell) => void` | Definir celda en edición |
| `api` | `GridApi<T>` | API pública (con seguridad) |
| `internalApi` | `GridApi<T>` | API interna (sin seguridad) |
| `setColumnOrder` | `(order: string[]) => void` | Reordenar columnas |
| `setColumnWidths` | `(widths: Record<string, number>) => void` | Redimensionar columnas |
| `setColumnPinned` | `(field, pinned) => void` | Fijar columna |
| `serverSideLoading` | `boolean` | Loading del server-side |
| `hasCustomRowNumber` | `boolean` | Tiene columna rowNumber personalizada |
| `hasCustomCheckbox` | `boolean` | Tiene columna checkbox personalizada |
| `fireEvent` | `(type, data) => void` | Disparar evento manualmente |
| `grouping` | `UseGroupingResult<T>` | Estado de agrupación |

---

## useVirtualization

Virtual scrolling para grandes datasets. Renderiza solo las filas visibles en el viewport.

```typescript
import { useVirtualization } from 'fibogrid';

const result = useVirtualization<MeuTipo>(rows, options);
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Filas a virtualizar |
| `options` | `VirtualizationOptions` | Configuración |

### VirtualizationOptions

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-----------|
| `rowHeight` | `number` | `40` | Altura de cada fila en px |
| `overscan` | `number` | `5` | Filas extra renderizadas arriba/abajo |
| `containerHeight` | `number` | — | Altura del viewport |

### Retorno (`VirtualizationResult<T>`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `virtualRows` | `RowNode<T>[]` | Solo filas visibles (+ overscan) |
| `totalHeight` | `number` | Altura total del scroll (todas las filas) |
| `offsetTop` | `number` | Offset Y para posicionar las filas |
| `startIndex` | `number` | Índice de la primera fila visible |
| `endIndex` | `number` | Índice de la última fila visible |
| `scrollTop` | `number` | Posición actual del scroll |
| `handleScroll` | `(event) => void` | Handler del evento de scroll |
| `scrollToRow` | `(index: number) => void` | Hacer scroll hasta una fila |
| `containerRef` | `RefObject<HTMLDivElement>` | Ref del contenedor |

---

## useColumnResize

Controla el redimensionamiento de columnas mediante drag en el separador del header.

```typescript
import { useColumnResize } from 'fibogrid';

const result = useColumnResize(onResize);
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `onResize` | `(field: string, width: number) => void` | Callback de resize |

### Retorno (`ColumnResizeResult`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `isResizing` | `boolean` | Resize en curso |
| `resizingColumn` | `string \| null` | Campo de la columna que se está redimensionando |
| `handleResizeStart` | `(field, startX, startWidth) => void` | Iniciar resize |
| `handleResizeDoubleClick` | `(field) => void` | Auto-size al hacer double-click |

---

## useColumnDrag

Drag-and-drop para reordenación de columnas.

```typescript
import { useColumnDrag } from 'fibogrid';

const result = useColumnDrag(onColumnMove);
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `onColumnMove` | `(fromIndex: number, toIndex: number) => void` | Callback de movimiento |

### Retorno (`ColumnDragResult`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `isDragging` | `boolean` | Drag en curso |
| `draggedColumn` | `string \| null` | Campo de la columna que se está arrastrando |
| `dragOverColumn` | `string \| null` | Campo de la columna bajo el cursor |
| `handleDragStart` | `(field, index) => void` | Iniciar drag |
| `handleDragOver` | `(field, index) => void` | Cursor sobre columna |
| `handleDragEnd` | `() => void` | Finalizar drag |
| `handleDrop` | `(targetIndex) => void` | Soltar columna |

---

## useRowDrag

Drag-and-drop de filas para reordenación.

```typescript
import { useRowDrag } from 'fibogrid';

const result = useRowDrag(onRowMove, onDragStart, onDragEnd, onDragMove);
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `onRowMove` | `(fromIndex, toIndex) => void` | Callback de movimiento |
| `onDragStart` | `(event: RowDragEvent<T>) => void` | Opcional: inicio del drag |
| `onDragEnd` | `(event: RowDragEvent<T>) => void` | Opcional: fin del drag |
| `onDragMove` | `(event: RowDragEvent<T>) => void` | Opcional: durante el drag |

### Retorno (`RowDragResult<T>`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `isDragging` | `boolean` | Drag en curso |
| `draggedRow` | `RowNode<T> \| null` | Fila que se está arrastrando |
| `dropTargetRow` | `RowNode<T> \| null` | Fila destino del drop |
| `dropPosition` | `'above' \| 'below' \| null` | Posición relativa del drop |
| `handleDragStart` | `(row, event) => void` | Iniciar drag |
| `handleDragOver` | `(row, event) => void` | Cursor sobre fila |
| `handleDrop` | `(event) => void` | Soltar fila |
| `handleDragEnd` | `() => void` | Finalizar drag |

---

## useRangeSelection

Selección de rango de celdas estilo Excel (click + arrastrar).

```typescript
const result = useRangeSelection<MeuTipo>();
```

### Retorno (`RangeSelectionResult`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `isSelecting` | `boolean` | Selección en curso |
| `selectionStart` | `{rowId, field} \| null` | Celda de inicio |
| `selectionEnd` | `{rowId, field} \| null` | Celda final |
| `selectedCells` | `Set<string>` | Celdas seleccionadas (formato "rowId:field") |
| `handleCellMouseDown` | `(rowId, field, event) => void` | Mouse down en la celda |
| `handleCellMouseEnter` | `(rowId, field) => void` | Mouse enter en la celda |
| `handleMouseUp` | `() => void` | Mouse up (finalizar selección) |
| `clearSelection` | `() => void` | Limpiar selección |
| `isCellSelected` | `(rowId, field) => boolean` | Verificar si la celda está seleccionada |

---

## useRowRangeSelection

Selección de rango de filas (Shift+Click para seleccionar varias).

```typescript
const result = useRowRangeSelection<MeuTipo>();
```

### Retorno (`RowRangeSelectionResult`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `isDraggingRows` | `boolean` | Selección de rango en curso |
| `handleRowMouseDown` | `(rowIndex, event) => void` | Mouse down en la fila |
| `handleRowMouseEnter` | `(rowIndex) => void` | Mouse enter en la fila |
| `handleRowMouseUp` | `() => void` | Mouse up (finalizar) |

---

## useKeyboardNavigation

Navegación por teclado con soporte para atajos personalizados.

```typescript
const result = useKeyboardNavigation<MeuTipo>(props);
```

### Parámetros (`UseKeyboardNavigationProps<T>`)

| Param | Tipo | Descripción |
|-------|------|-----------|
| `containerRef` | `RefObject<HTMLDivElement>` | Ref del contenedor del grid |
| `displayedRows` | `RowNode<T>[]` | Filas mostradas |
| `columns` | `ProcessedColumn<T>[]` | Columnas procesadas |
| `api` | `GridApi<T>` | API del grid |
| `onStartEdit` | `(rowId, field) => void` | Callback para iniciar la edición |
| `onStopEdit` | `(cancel?) => void` | Callback para detener la edición |
| `isEditing` | `boolean` | Si está en modo edición |
| `shortcuts` | `boolean \| ShortcutDef<T>[]` | Atajos personalizados |

### Retorno

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `focusedCell` | `{rowId, field} \| null` | Celda con foco |
| `focusCell` | `(rowIndex, colIndex) => void` | Enfocar celda por índices |
| `isCellFocused` | `(rowId, field) => boolean` | Verificar foco |
| `setFocusedCell` | `(cell) => void` | Definir foco manualmente |
| `handleKeyDown` | `(event) => void` | Handler de teclado |

---

## useCellSelection

Selección individual de celdas con soporte para fill handle.

```typescript
const result = useCellSelection<MeuTipo>(rows, columns);
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Filas mostradas |
| `columns` | `ProcessedColumn<T>[]` | Columnas procesadas |

### Retorno (`UseCellSelectionResult`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `selectedRange` | `{start, end} \| null` | Rango seleccionado |
| `isSelecting` | `boolean` | Selección en curso |
| `isCellSelected` | `(rowId, field) => boolean` | La celda está seleccionada |
| `handleCellMouseDown` | `(rowId, field, event) => void` | Mouse down |
| `handleCellMouseEnter` | `(rowId, field) => void` | Mouse enter |
| `handleMouseUp` | `() => void` | Mouse up |
| `clearSelection` | `() => void` | Limpiar |
| `getSelectedCells` | `() => {rowId, field, value}[]` | Obtener celdas seleccionadas |
| `fillHandlePosition` | `{rowId, field} \| null` | Posición del fill handle |
| `isFillHandleDragging` | `boolean` | Fill handle siendo arrastrado |
| `fillRange` | `{start, end} \| null` | Rango del fill |

---

## useFillHandle

Fill handle para extender valores (arrastrar la esquina inferior derecha de la selección).

```typescript
const result = useFillHandle<MeuTipo>(options);
```

### Parámetros (`UseFillHandleOptions<T>`)

| Param | Tipo | Descripción |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Filas mostradas |
| `columns` | `ProcessedColumn<T>[]` | Columnas procesadas |
| `onFill` | `(source, target) => void` | Callback de relleno |

### Retorno (`UseFillHandleResult`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `fillRange` | `{start, end} \| null` | Rango de relleno |
| `isFilling` | `boolean` | Relleno en curso |
| `handleFillStart` | `(rowId, field) => void` | Iniciar fill |
| `handleFillMove` | `(rowId, field) => void` | Mover fill |
| `handleFillEnd` | `() => void` | Finalizar fill |
| `getFillHandlePosition` | `() => {x, y} \| null` | Posición visual del handle |

---

## useUndoRedo

Sistema de deshacer/rehacer con historial configurable.

```typescript
const result = useUndoRedo<MeuTipo>({ maxHistory: 50 });
```

### Parámetros (`UseUndoRedoOptions<T>`)

| Param | Tipo | Default | Descripción |
|-------|------|---------|-----------|
| `maxHistory` | `number` | `50` | Máximo de operaciones en el historial |

### Retorno (`UseUndoRedoResult<T>`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `recordChange` | `(change) => void` | Registrar cambio en el historial |
| `undo` | `() => Change \| undefined` | Deshacer el último cambio |
| `redo` | `() => Change \| undefined` | Rehacer el cambio deshecho |
| `canUndo` | `boolean` | Hay operaciones para deshacer |
| `canRedo` | `boolean` | Hay operaciones para rehacer |
| `clearHistory` | `() => void` | Limpiar el historial completo |

---

## useGrouping

Agrupación de filas por campos con agregaciones y expansión.

```typescript
const result = useGrouping<MeuTipo>(options);
```

### Parámetros (`UseGroupingOptions<T>`)

| Param | Tipo | Descripción |
|-------|------|-----------|
| `rows` | `RowNode<T>[]` | Filas a agrupar |
| `groupByFields` | `string[]` | Campos por los que agrupar |
| `splitByField` | `string` | Campo por el que dividir |
| `aggregations` | `Record<string, AggFunc>` | Funciones de agregación |
| `getRowId` | `(data: T) => string` | Función de ID |
| `overrides` | `Record<string, any>` | Overrides de valores |

### Retorno (`UseGroupingResult<T>`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `displayRows` | `GroupableRowNode<T>[]` | Filas listas para mostrar (con grupos) |
| `groupedRows` | `GroupableRowNode<T>[]` | Filas agrupadas (jerarquía) |
| `expandedGroups` | `Set<string>` | IDs de grupos expandidos |
| `toggleGroupExpand` | `(groupId: string) => void` | Expandir/colapsar grupo |
| `expandAllGroups` | `() => void` | Expandir todos los grupos |
| `collapseAllGroups` | `() => void` | Colapsar todos los grupos |
| `setGroupByFields` | `(fields: string[]) => void` | Cambiar campos de agrupación |
| `isGroupRow` | `(node) => boolean` | Verificar si es fila de grupo |
| `addChildToRow` | `(parentId, data) => void` | Añadir hijos a una fila |
| `expandedRows` | `Set<string>` | IDs de filas expandidas (tree) |
| `toggleRowExpand` | `(rowId: string) => void` | Expandir/colapsar fila tree |
| `hasChildren` | `boolean` | Alguna fila tiene hijos |

---

## useServerSideData

Carga de datos del servidor con estado de loading y error.

```typescript
const result = useServerSideData<MeuTipo>(enabled, dataSource, request);
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `enabled` | `boolean` | Si el modo server-side está activo |
| `dataSource` | `ServerSideDataSource<T>` | Fuente de datos remota |
| `request` | `ServerSideDataSourceRequest` | Request actual (page, sort, filter) |

### Retorno (`ServerSideDataState<T>`)

| Campo | Tipo | Descripción |
|-------|------|-----------|
| `data` | `T[]` | Datos recibidos del servidor |
| `totalRows` | `number` | Total de filas en el servidor |
| `loading` | `boolean` | Carga en curso |
| `error` | `Error \| null` | Error del último request |
| `refresh` | `() => void` | Recargar datos |
| `updateData` | `(data: T[]) => void` | Actualizar datos localmente |

---

## useGridEvents

Crea un EventBuilder para un grid específico a través del Registry.

```typescript
import { useGridEvents } from 'fibogrid';

const events = useGridEvents<MeuTipo>('meu-grid-id');
events.onSelectionChanged().listen(handler);
events.onFilterChanged().listen(handler);
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `gridId` | `string` | ID del grid |

### Retorno

`EventBuilder<T>` — ver la sección 05-api para los detalles completos.

---

## useGridEvent

Hook declarativo para suscribirse a un evento específico de un grid. Auto-cleanup en el unmount.

```typescript
import { useGridEvent } from 'fibogrid';

useGridEvent('meu-grid-id', 'selectionChanged', (event) => {
  console.log('Selecao:', event.selectedRows);
});
```

### Parámetros

| Param | Tipo | Descripción |
|-------|------|-----------|
| `gridId` | `string` | ID del grid |
| `eventName` | `string` | Nombre del evento |
| `handler` | `(event: any) => void` | Callback del evento |

---

## Hooks internos (grid-state/)

Hooks usados internamente por `useGridState`. No se exportan directamente, pero se documentan como referencia.

### useGridColumns

Procesamiento de columnas: flex layout, anchos, pinning, ordenación, visibilidad.

| Retorno | Tipo | Descripción |
|---------|------|-----------|
| `columnOrder` | `string[]` | Orden de las columnas |
| `setColumnOrder` | `(order) => void` | Reordenar |
| `columnWidths` | `Record<string, number>` | Anchos por campo |
| `setColumnWidths` | `(widths) => void` | Redimensionar |
| `hiddenColumns` | `Set<string>` | Columnas ocultas |
| `setHiddenColumns` | `(hidden) => void` | Ocultar/mostrar |
| `pinnedColumns` | `Record<string, 'left'\|'right'>` | Columnas fijas |
| `setPinnedColumns` | `(pinned) => void` | Fijar/desfijar |
| `processedColumns` | `ProcessedColumn<T>[]` | Columnas finales procesadas |
| `hasCustomRowNumber` | `boolean` | Columna rowNumber definida |
| `hasCustomCheckbox` | `boolean` | Columna checkbox definida |
| `columns` | `ColumnDef<T>[]` | Columnas originales |
| `setColumnPinned` | `(field, pinned) => void` | Fijar columna |

### useGridRows

Creación de RowNodes, aplicación de sort/filter, gestión de overrides y server-side data.

| Retorno | Tipo | Descripción |
|---------|------|-----------|
| `rows` | `RowNode<T>[]` | Todas las filas |
| `filteredRows` | `RowNode<T>[]` | Tras los filtros |
| `sortedRows` | `RowNode<T>[]` | Tras el sort |
| `displayedRows` | `RowNode<T>[]` | Tras la paginación |
| `internalRowData` | `T[]` | Datos internos |
| `overrides` | `Record<string, Record<string, any>>` | Overrides de edición |
| `setOverrides` | `(overrides) => void` | Definir overrides |
| `historyRef` | `RefObject` | Ref del historial undo/redo |
| `serverSideState` | `ServerSideDataState<T>` | Estado server-side |
| `totalRows` | `number` | Total de filas (pre-paginación) |

### useGridSelection

Gestión de selección single/multiple con soporte para Shift y Ctrl.

| Retorno | Tipo | Descripción |
|---------|------|-----------|
| `selection` | `SelectionState` | Estado de selección |
| `setSelection` | `(state) => void` | Definir selección |
| `selectionRef` | `RefObject<SelectionState>` | Ref estable de la selección |
| `selectRow` | `(id, selected?, event?) => void` | Seleccionar con Shift/Ctrl |
| `selectRows` | `(ids, selected?) => void` | Seleccionar varias |
| `selectAll` | `() => void` | Seleccionar todas |
| `deselectAll` | `() => void` | Deseleccionar todas |

### useGridSortFilter

Sort multi-columna, filtros compuestos y quick filter.

| Retorno | Tipo | Descripción |
|---------|------|-----------|
| `sortModel` | `SortModel[]` | Modelo de sort activo |
| `setSortModel` | `(model) => void` | Definir sort |
| `filterModel` | `FilterModel[]` | Modelo de filtros activo |
| `setFilterModel` | `(model, opts?) => void` | Definir filtros |
| `quickFilter` | `string` | Texto de filtro rápido |
| `setQuickFilter` | `(text) => void` | Definir filtro rápido |

### useGridEditing

Edición inline de celdas con overrides e integración con undo/redo.

### useGridEventSystem

Pub/sub interno de eventos del grid. Se usa para la comunicación entre sub-hooks.

### useGridApi

Montaje de la GridApi<T> completa con security proxies (validación Ingress/Egress).

### useClickDetector

Detección del tipo de click: single, double, triple, context menu. Usa un timer interno para diferenciar clicks consecutivos.
