# 04 - Special Renderers

## Ubicación

```
src/components/FiboGrid/components/SpecialRenderers.tsx
```

---

## RowNumberRenderer

Renderiza el número secuencial de la fila (rowIndex + 1).

```typescript
// Adicionado automaticamente quando configs.center.rowNumbers = true
// Ou quando existe coluna com type: 'rowNumber'
```

### Props

| Prop | Tipo | Descripción |
|------|------|-----------|
| `rowIndex` | `number` | Índice de la fila |

---

## CheckboxCellRenderer

Checkbox de selección por fila. Se añade automáticamente cuando:
- `configs.center.checkboxSelection = true`
- O columna con `type: 'checkbox'` o `checkboxSelection: true`

### Props

| Prop | Tipo | Descripción |
|------|------|-----------|
| `rowNode` | `RowNode<T>` | Nodo de la fila |
| `selected` | `boolean` | Estado de la selección |
| `onToggle` | `() => void` | Callback de toggle |

---

## CheckboxHeaderRenderer

Checkbox en la cabecera para "seleccionar todos". Soporta estado indeterminado.

### Props

| Prop | Tipo | Descripción |
|------|------|-----------|
| `allSelected` | `boolean` | Todas seleccionadas |
| `someSelected` | `boolean` | Algunas seleccionadas (indeterminate) |
| `onToggle` | `() => void` | Callback de toggle all |

### Estados

| Estado | Visual |
|--------|--------|
| Ninguna seleccionada | Checkbox vacío |
| Algunas seleccionadas | Checkbox indeterminado (—) |
| Todas seleccionadas | Checkbox marcado |

---

## GridContext (Provider interno)

### Ubicación

```
src/components/FiboGrid/context/GridContext.tsx
```

### GridContextValue

```typescript
interface GridContextValue {
  registerGrid: (id: string, api: GridApi<any>) => void;
  unregisterGrid: (id: string) => void;
  getGridApi: (id: string) => GridApi<any> | undefined;
  onRowSelect: (rowId: string, selected: boolean) => void;
  subscribeToRowSelect: (callback: (rowId: string, selected: boolean) => void) => () => void;
  locale: FiboGridLocale;
}
```

### Uso

```typescript
import { GridProvider, useGridContext } from 'fibogrid';

// Provider (usado internamente pelo FiboGrid)
<GridProvider value={contextValue}>
  {children}
</GridProvider>

// Consumer
const { locale, getGridApi } = useGridContext();
```
