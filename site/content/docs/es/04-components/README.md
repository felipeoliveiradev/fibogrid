# 04 - Componentes

## Ubicación

```
src/components/FiboGrid/components/
```

## Índice

| Archivo | Contenido |
|----------|----------|
| [README.md](./README.md) | FiboGrid, GridToolbar, GridStatusBar, ColumnMenu, GroupRow, ColumnPanel, FilterPanel |
| [special-renderers.md](./special-renderers.md) | RowNumberRenderer, CheckboxCellRenderer, CheckboxHeaderRenderer, GridContext |

---

## FiboGrid<T>

Componente principal. Recibe datos, columnas y configuraciones.

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

### Props principales

| Prop | Tipo | Default | Descripción |
|------|------|---------|-----------|
| `rowData` | `T[]` | obligatorio | Array de datos |
| `columnDefs` | `ColumnDef<T>[]` | obligatorio | Definiciones de columnas |
| `getRowId` | `(data: T) => string` | auto | Función para el ID único de la fila |
| `gridId` | `string` | auto | ID para el registro en el GridRegistry |
| `pagination` | `boolean` | `false` | Activar paginación |
| `paginationPageSize` | `number` | `10` | Elementos por página |
| `paginationPageSizeOptions` | `number[]` | `[10,20,50]` | Opciones de tamaño |
| `paginationMode` | `'client' \| 'server'` | `'client'` | Modo de paginación |
| `serverSideDataSource` | `ServerSideDataSource<T>` | — | Data source para server-side |
| `rowSelection` | `'single' \| 'multiple'` | — | Tipo de selección |
| `rangeCellSelection` | `boolean` | `false` | Selección estilo Excel |
| `rowDragEnabled` | `boolean` | `false` | Drag de filas |
| `defaultColDef` | `Partial<ColumnDef<T>>` | — | Defaults para todas las columnas |
| `rowHeight` | `number` | `40` | Altura de la fila en px |
| `headerHeight` | `number` | `44` | Altura de la cabecera |
| `height` | `number \| string` | — | Altura del grid |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Tema |
| `loading` | `boolean` | `false` | Mostrar overlay de loading |
| `quickFilterText` | `string` | — | Texto de filtro rápido |
| `showToolbar` | `boolean` | `false` | Mostrar toolbar |
| `showStatusBar` | `boolean` | `false` | Mostrar status bar |
| `contextMenu` | `boolean` | `false` | Menú contextual (right-click) |
| `groupByFields` | `string[]` | — | Campos por los que agrupar |
| `groupAggregations` | `Record<string, AggFunc>` | — | Agregaciones por campo |
| `treeData` | `boolean` | `false` | Datos jerárquicos |
| `lang` | `FiboGridLocale` | `enUS` | Idioma |
| `shortcuts` | `boolean \| ShortcutDef[]` | `false` | Atajos de teclado |
| `configs` | `FiboGridConfigs` | — | Configuración avanzada de layout |
| `egress` | `GridEgress[]` | — | Permisos de salida |
| `ingress` | `GridIngress[]` | — | Permisos de entrada |

### Props de eventos

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

Barra de herramientas con search, filtros, export y gestión de columnas.

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

- Búsqueda rápida (quick filter)
- Botón de filtros con contador de filtros activos
- Toggle de columnas (show/hide)
- Botón de export (CSV/Excel)
- Botón de copiar al clipboard
- Toggle de densidad (compact/normal/comfortable)
- Acciones personalizadas vía `configs.header.customActions`

---

## GridStatusBar

Barra de estado en el pie con información agregada.

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

### Información mostrada

- Total de filas
- Filas seleccionadas
- Agregaciones (suma, media, min, max, conteo)

---

## ColumnMenu

Menú contextual por columna (click en la cabecera).

```tsx
import { ColumnMenu } from 'fibogrid';
```

### Opciones

- Ordenar ascendente/descendente
- Fijar columna (izquierda/derecha/ninguno)
- Ajustar el ancho automáticamente
- Filtrar columna
- Ocultar columna

---

## GroupRow

Fila de grupo cuando `groupByFields` está activo.

```tsx
import { GroupRow } from 'fibogrid';
```

### Funcionalidades

- Expandir/colapsar grupo
- Mostrar conteo de hijos
- Mostrar valores de agregación

---

## ColumnPanel

Panel lateral para la gestión de visibilidad y orden de columnas.

```tsx
import { ColumnPanel } from 'fibogrid';
```

---

## FilterPanel

Panel de filtros avanzados con soporte para múltiples condiciones.

```tsx
import { FilterPanel } from 'fibogrid';
```

### Tipos de filtro soportados

| Tipo | Operadores |
|------|-----------|
| `text` | contains, equals, startsWith, endsWith |
| `number` | equals, greaterThan, lessThan, between |
| `date` | equals, after, before, between |
| `select` | selección múltiple de valores |
| `boolean` | true / false |

---

## Componentes internos

| Componente | Descripción |
|------------|-----------|
| `GridHeader` | Cabeceras con indicadores de sort y resize handles |
| `GridRow` | Fila con selección, hover, drag, clase personalizada |
| `GridCell` | Celda con renderer, editor, formateo |
| `GridFooter` | Contenedor del pie |
| `GridPagination` | Controles de navegación de página |
| `GridOverlay` | Overlay de loading y "sin datos" |
| `ContextMenu` | Menú right-click con submenús |
| `FilterPopover` | Popover de selección de valores de filtro |
| `VirtualFilterList` | Lista virtualizada de valores en el filtro |
| `SpecialRenderers` | Renderers built-in (checkbox, rowNumber, action) |
