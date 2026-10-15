# 04 - Special Renderers

## 位置

```
src/components/FiboGrid/components/SpecialRenderers.tsx
```

---

## RowNumberRenderer

渲染行的序号（rowIndex + 1）。

```typescript
// Adicionado automaticamente quando configs.center.rowNumbers = true
// Ou quando existe coluna com type: 'rowNumber'
```

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `rowIndex` | `number` | 行索引 |

---

## CheckboxCellRenderer

每行的选择复选框。在以下情况下自动添加：
- `configs.center.checkboxSelection = true`
- 或存在 `type: 'checkbox'` 或 `checkboxSelection: true` 的列

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `rowNode` | `RowNode<T>` | 行节点 |
| `selected` | `boolean` | 选择状态 |
| `onToggle` | `() => void` | 切换回调 |

---

## CheckboxHeaderRenderer

表头中的"全选"复选框。支持不确定（indeterminate）状态。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `allSelected` | `boolean` | 全部已选中 |
| `someSelected` | `boolean` | 部分已选中（indeterminate） |
| `onToggle` | `() => void` | 全选切换回调 |

### 状态

| 状态 | 外观 |
|------|------|
| 未选中任何一项 | 空复选框 |
| 部分已选中 | 不确定复选框（—） |
| 全部已选中 | 已勾选复选框 |

---

## GridContext（内部 Provider）

### 位置

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

### 用法

```typescript
import { GridProvider, useGridContext } from 'fibogrid';

// Provider (usado internamente pelo FiboGrid)
<GridProvider value={contextValue}>
  {children}
</GridProvider>

// Consumer
const { locale, getGridApi } = useGridContext();
```
