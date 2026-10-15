# 04 - Special Renderers

## Localizacao

```
src/components/FiboGrid/components/SpecialRenderers.tsx
```

---

## RowNumberRenderer

Renderiza o numero sequencial da linha (rowIndex + 1).

```typescript
// Adicionado automaticamente quando configs.center.rowNumbers = true
// Ou quando existe coluna com type: 'rowNumber'
```

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `rowIndex` | `number` | Indice da linha |

---

## CheckboxCellRenderer

Checkbox de selecao por linha. Adicionado automaticamente quando:
- `configs.center.checkboxSelection = true`
- Ou coluna com `type: 'checkbox'` ou `checkboxSelection: true`

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `rowNode` | `RowNode<T>` | Nodo da linha |
| `selected` | `boolean` | Estado da selecao |
| `onToggle` | `() => void` | Callback de toggle |

---

## CheckboxHeaderRenderer

Checkbox no cabecalho para "selecionar todos". Suporta estado indeterminado.

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `allSelected` | `boolean` | Todas selecionadas |
| `someSelected` | `boolean` | Algumas selecionadas (indeterminate) |
| `onToggle` | `() => void` | Callback de toggle all |

### Estados

| Estado | Visual |
|--------|--------|
| Nenhuma selecionada | Checkbox vazio |
| Algumas selecionadas | Checkbox indeterminado (—) |
| Todas selecionadas | Checkbox marcado |

---

## GridContext (Provider Interno)

### Localizacao

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
