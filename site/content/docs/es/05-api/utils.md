# 05 - Funciones utilitarias

## Ubicación

```
src/components/FiboGrid/utils/
```

---

## helpers.ts

### generateRowId

Genera o extrae un ID único para una fila.

```typescript
function generateRowId<T>(data: T, index: number, getRowId?: (data: T) => string): string
```

- Si se proporciona `getRowId`, lo usa
- Si no, usa `data.id` si existe
- Si no, genera un ID basado en el índice

### createRowNode

Crea un `RowNode<T>` a partir de datos raw.

```typescript
function createRowNode<T>(data: T, index: number, getRowId?: (data: T) => string): RowNode<T>
```

Devuelve: `{ id, data, rowIndex, selected: false }`

### processColumns

Calcula anchos y posiciones de columnas (flex layout).

```typescript
function processColumns<T>(
  columns: ColumnDef<T>[],
  containerWidth: number,
  defaultColDef?: Partial<ColumnDef<T>>
): ProcessedColumn<T>[]
```

- Mezcla `defaultColDef` con cada columna
- Calcula `flex` proporcional al espacio restante
- Respeta `minWidth` y `maxWidth`
- Calcula `left` (posición horizontal acumulada)
- Define el `computedWidth` final

### sortRows

Aplica ordenación multi-columna a las rows.

```typescript
function sortRows<T>(
  rows: RowNode<T>[],
  sortModel: SortModel[],
  columns: ColumnDef<T>[]
): RowNode<T>[]
```

- Soporta múltiples columnas con prioridad por orden
- Usa el `comparator` personalizado de la columna si está definido
- Fallback a `defaultComparator`

### filterRows

Aplica filtros compuestos y quick filter.

```typescript
function filterRows<T>(
  rows: RowNode<T>[],
  filterModel: FilterModel[],
  columns: ColumnDef<T>[],
  quickFilterText?: string
): RowNode<T>[]
```

- Todos los filtros son AND (todas las condiciones deben ser verdaderas)
- Quick filter busca en todos los campos
- Usa el `filterComparator` personalizado si está definido en la columna
- Usa el `useInternalFilter` de la columna si está definido

### fastComparator

Comparación rápida para tipos primitivos.

```typescript
function fastComparator(a: any, b: any): number
```

### defaultComparator

Comparación por defecto con soporte para Date, string y números.

```typescript
function defaultComparator(a: any, b: any): number
```

- Trata `null/undefined` como menores
- Convierte `Date` a timestamp
- Los strings se comparan sin distinguir mayúsculas de minúsculas (case-insensitive)

### getValueFromPath

Acceso profundo a propiedades con notación de punto.

```typescript
function getValueFromPath(obj: any, path: string): any
```

```typescript
getValueFromPath({ a: { b: { c: 42 } } }, 'a.b.c'); // 42
getValueFromPath({ items: [1, 2] }, 'items.0');      // 1
```

### setValueAtPath

Definir un valor profundo con notación de punto.

```typescript
function setValueAtPath<T>(obj: T, path: string, value: any): T
```

Devuelve un objeto nuevo (inmutable).

---

## grouping.ts

### isGroupNode

Type guard para verificar si un nodo es un grupo.

```typescript
function isGroupNode<T>(node: GroupableRowNode<T>): node is GroupRowNode<T>
```

### groupRowsByFields

Agrupa filas por uno o más campos con agregaciones.

```typescript
function groupRowsByFields<T>(
  rows: RowNode<T>[],
  groupFields: string[],
  aggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: any[]) => any)>
): GroupableRowNode<T>[]
```

- Agrupación jerárquica (multinivel)
- Calcula agregaciones por grupo
- Cada grupo tiene `children` con las rows del grupo

### splitRowsByField

Divide filas por campo — crea separadores visuales sin jerarquía.

```typescript
function splitRowsByField<T>(rows: RowNode<T>[], splitField: string): GroupableRowNode<T>[]
```

### addChildRows

Añade hijos a una fila padre (tree data).

```typescript
function addChildRows<T>(
  rows: RowNode<T>[],
  parentId: string,
  childData: T[],
  getRowId?: (data: T) => string
): RowNode<T>[]
```

### flattenGroupedRows

Aplana la jerarquía de grupos teniendo en cuenta el estado de expansión.

```typescript
function flattenGroupedRows<T>(
  groupedRows: GroupableRowNode<T>[],
  expandedGroups: Set<string>
): GroupableRowNode<T>[]
```

- Los grupos colapsados no incluyen hijos
- Los grupos expandidos incluyen hijos de forma recursiva

### Tipos de Grouping

```typescript
interface GroupRowNode<T> {
  id: string;
  groupField: string;
  groupValue: any;
  children: GroupableRowNode<T>[];
  aggregations: Record<string, any>;
  level: number;
  expanded: boolean;
  rowCount: number;
}

interface RegularRowNode<T> extends RowNode<T> {
  level: number;
}

type GroupableRowNode<T> = GroupRowNode<T> | RegularRowNode<T>;
```

---

## shortcuts.ts

### isShortcutMatch

Verifica si un evento de teclado corresponde a un atajo definido.

```typescript
function isShortcutMatch(event: KeyboardEvent | React.KeyboardEvent, shortcut: ShortcutDef): boolean
```

- Soporta combinaciones: `Ctrl+A`, `Meta+A`, `Shift+Tab`
- Soporta múltiples combinaciones por atajo: `['Ctrl+A', 'Meta+A']`
- Case-insensitive

### defaultShortcuts

10 atajos built-in activados cuando `shortcuts={true}`.

```typescript
const defaultShortcuts: ShortcutDef[] = [
  { id: 'nav-up',      keys: 'ArrowUp',    action: navegar linha acima },
  { id: 'nav-down',    keys: 'ArrowDown',  action: navegar linha abaixo },
  { id: 'nav-left',    keys: 'ArrowLeft',  action: navegar celula esquerda },
  { id: 'nav-right',   keys: 'ArrowRight', action: navegar celula direita },
  { id: 'nav-tab',     keys: 'Tab',        action: proxima celula },
  { id: 'nav-tab-rev', keys: 'Shift+Tab',  action: celula anterior },
  { id: 'edit-enter',  keys: ['Enter', 'F2'], action: iniciar/confirmar edicao },
  { id: 'select-all',  keys: ['Ctrl+A', 'Meta+A'], action: selecionar tudo },
  { id: 'copy',        keys: ['Ctrl+C', 'Meta+C'], action: copiar para clipboard },
  { id: 'paste',       keys: ['Ctrl+V', 'Meta+V'], action: colar do clipboard },
  { id: 'undo',        keys: ['Ctrl+Z', 'Meta+Z'], action: desfazer },
];
```

---

## excelExport.ts

### exportToExcel

Export básico a Excel (.xlsx).

```typescript
function exportToExcel<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params?: ExportParams
): void
```

### exportToExcelWithStyles

Export a Excel con estilos opcionales.

```typescript
function exportToExcelWithStyles<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params?: ExcelExportParams
): void
```

### ExcelExportParams

```typescript
interface ExcelExportParams extends ExportParams {
  sheetName?: string;
  headerStyle?: Record<string, any>;
  cellStyle?: Record<string, any>;
}
```

---

## EventBuilder.ts

Ver la sección `05-api/README.md` para la documentación completa del EventBuilder.

---

## permissionValidator.ts

### validateIngress

Valida si una acción está permitida por las reglas de ingress.

```typescript
function validateIngress(
  ingress: GridIngress[] | undefined,
  origin: string,
  action: string
): boolean
```

### Lógica de validación

1. Si `ingress` no está definido → permite todo
2. Si `ingress` está definido pero vacío → bloquea todo (Deny All)
3. Busca la regla para el `origin`
4. Verifica wildcards: `'*'`, `'api.*'`, `'manager.*'`
5. Verifica el permiso específico
6. Si está bloqueado → emite `console.warn` con detalles

---

## CSS (Estilos)

### Ubicación

```
src/components/FiboGrid/styles/
```

### Archivos

| Archivo | Tamaño | Descripción |
|----------|---------|-----------|
| `core.css` | ~17KB | Layout base: grid, celdas, filas, cabeceras, scroll, pinned, resize |
| `theme.css` | ~80KB | Variables CSS completas: light mode + dark mode + todos los estados |
| `theme-mapping.css` | ~2.6KB | Mapeo de variables CSS a componentes |
| `lib.css` | ~1KB | Imports y entry point para el build de la lib |
| `index.css` | ~1KB | Entry point para la app de demo |

### Variables CSS principales (80+)

Organizadas por categoría:

- **Colores base**: bg, surface, text, text-secondary, text-muted, primary, border
- **Celdas**: cell-bg, cell-border, cell-padding, cell-text
- **Filas**: row-hover, row-selected, row-stripe, row-height
- **Cabeceras**: header-bg, header-text, header-height, header-border
- **Botones**: button-bg, button-hover, button-active, button-text
- **Inputs**: input-bg, input-border, input-focus, input-text
- **Scrollbar**: scrollbar-track, scrollbar-thumb, scrollbar-width
- **Sombras**: shadow-sm, shadow-md, shadow-lg
- **Z-index**: popover, select, modal, overlay, header, pinned
- **Pinned**: pinned-bg, pinned-shadow, pinned-border
- **Drag**: drag-bg, drag-border, drag-indicator
- **Filtros**: filter-bg, filter-active, filter-badge
- **Paginación**: pagination-bg, pagination-active, pagination-disabled
