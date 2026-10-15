# 04 - Special Renderers

## Location

```
src/components/FiboGrid/components/SpecialRenderers.tsx
```

---

## RowNumberRenderer

Renders the sequential row number (rowIndex + 1).

```typescript
// Added automatically when configs.center.rowNumbers = true
// Or when a column with type: 'rowNumber' exists
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `rowIndex` | `number` | Row index |

---

## CheckboxCellRenderer

Per-row selection checkbox. Added automatically when:
- `configs.center.checkboxSelection = true`
- Or a column with `type: 'checkbox'` or `checkboxSelection: true`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `rowNode` | `RowNode<T>` | Row node |
| `selected` | `boolean` | Selection state |
| `onToggle` | `() => void` | Toggle callback |

---

## CheckboxHeaderRenderer

Header checkbox for "select all". Supports the indeterminate state.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `allSelected` | `boolean` | All selected |
| `someSelected` | `boolean` | Some selected (indeterminate) |
| `onToggle` | `() => void` | Toggle-all callback |

### States

| State | Visual |
|-------|--------|
| None selected | Empty checkbox |
| Some selected | Indeterminate checkbox (—) |
| All selected | Checked checkbox |

---

## GridContext (Internal Provider)

### Location

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

### Usage

```typescript
import { GridProvider, useGridContext } from 'fibogrid';

// Provider (used internally by FiboGrid)
<GridProvider value={contextValue}>
  {children}
</GridProvider>

// Consumer
const { locale, getGridApi } = useGridContext();
```
