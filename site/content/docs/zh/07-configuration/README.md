# 07 - 配置

## FiboGridConfigs

通过 `configs` prop 对表格布局进行高级配置。

```tsx
<FiboGrid
  configs={{
    compact: true,
    zIndex: { popover: 50, select: 40, modal: 100 },
    header: {
      show: true,
      layout: ['search', 'spacer', 'filter-button', 'export-button', 'columns-button'],
      search: true,
      filterButton: true,
      densityButton: true,
      exportButton: true,
      columnsButton: true,
      copyButton: true,
      refreshButton: false,
      filterRow: false,
      customActions: <MeuBotao />,
    },
    center: {
      rowNumbers: true,
      checkboxSelection: true,
      stripes: true,
      borders: true,
    },
    footer: {
      show: true,
      layout: ['pagination', 'spacer', 'status-bar'],
      pagination: true,
      information: true,
    },
  }}
/>
```

### Header Layout 项

| 项 | 说明 |
|----|------|
| `search` | 快速搜索输入框 |
| `active-filters` | 显示当前过滤器的 Chips |
| `filter-button` | 打开过滤面板的按钮 |
| `density-button` | 切换 compact/normal/comfortable |
| `export-button` | 导出 CSV/Excel |
| `columns-button` | 列管理面板 |
| `copy-button` | 复制到剪贴板 |
| `refresh-button` | 刷新按钮 |
| `custom-actions` | 自定义操作（ReactNode） |
| `spacer` | 弹性占位 |

### Footer Layout 项

| 项 | 说明 |
|----|------|
| `pagination` | 完整的分页控件 |
| `pagination-page-size` | 每页大小选择器 |
| `pagination-info` | 文本 "1-20 / 100" |
| `pagination-controls` | 上一页/下一页按钮 |
| `status-bar` | 完整的状态栏 |
| `status-info` | 行数统计 |
| `status-selected` | 已选中数量统计 |
| `status-aggregations` | 聚合值 |
| `spacer` | 弹性占位 |

---

## Default Column Definition（默认列定义）

为所有列设置默认属性。

```tsx
<FiboGrid
  defaultColDef={{
    sortable: true,
    filterable: true,
    resizable: true,
    minWidth: 100,
  }}
  columnDefs={[
    { field: 'nome', headerName: 'Nome' },           // herda sortable, filterable, resizable
    { field: 'id', headerName: 'ID', sortable: false }, // override: nao ordena
  ]}
/>
```

---

## 主题

### 通过 Prop

```tsx
<FiboGrid theme="light" />  // ou "dark" ou "auto"
```

### CSS 变量（浅色）

```css
.fibogrid {
  --fibogrid-bg: #ffffff;
  --fibogrid-surface: #fafafa;
  --fibogrid-text: #1a1a1a;
  --fibogrid-text-secondary: #666666;
  --fibogrid-text-muted: #999999;
  --fibogrid-primary: hsl(40, 65%, 45%);
  --fibogrid-primary-hover: hsl(40, 65%, 55%);
  --fibogrid-primary-text: #ffffff;
  --fibogrid-border: #e0e0e0;
  --fibogrid-border-cell: #f0f0f0;
  --fibogrid-row-hover: #f5f5f5;
  --fibogrid-row-selected: hsl(40, 65%, 95%);
  --fibogrid-row-stripe: #fafafa;
  --fibogrid-header-bg: #f8f8f8;
  --fibogrid-header-text: #333333;
}
```

### CSS 变量（深色）

```css
.fibogrid[data-theme="dark"] {
  --fibogrid-bg: #1a1a2e;
  --fibogrid-surface: #16213e;
  --fibogrid-text: #e8e8e8;
  --fibogrid-text-secondary: #a0a0a0;
  --fibogrid-primary: hsl(40, 65%, 55%);
  --fibogrid-border: #2a2a4a;
  --fibogrid-row-hover: #1e2a4a;
  --fibogrid-row-selected: hsl(40, 65%, 20%);
  --fibogrid-header-bg: #0f1a35;
}
```

### 尺寸变量

```css
.fibogrid {
  --fibogrid-row-height: 40px;
  --fibogrid-header-height: 44px;
  --fibogrid-cell-padding: 12px;
  --fibogrid-font-size: 14px;
  --fibogrid-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### 预定义主题

| 类名 | 说明 |
|------|------|
| `fibogrid-compact` | 紧凑布局（较小的 row-height） |
| `fibogrid-comfortable` | 宽松布局 |
| `fibogrid-material` | Material Design 风格 |
| `fibogrid-minimal` | 极简设计 |

### 自定义

```css
/* Override via CSS */
.meu-grid .fibogrid {
  --fibogrid-primary: #3b82f6;
  --fibogrid-row-height: 36px;
  --fibogrid-font-size: 13px;
}
```

---

## Z-Index

控制覆盖层和弹出层的层级。

```tsx
<FiboGrid
  configs={{
    zIndex: {
      popover: 50,
      select: 40,
      modal: 100,
    },
  }}
/>
```

---

## 密度

可通过工具栏或编程方式在不同密度之间切换。

| 密度 | 行高 | 说明 |
|------|------|------|
| `compact` | ~32px | 显示更多数据 |
| `normal` | ~40px | 默认 |
| `comfortable` | ~52px | 更宽松 |

---

## 分页

### 客户端

```tsx
<FiboGrid
  pagination
  paginationPageSize={20}
  paginationPageSizeOptions={[10, 20, 50, 100]}
/>
```

### 服务端

```tsx
<FiboGrid
  pagination
  paginationMode="server"
  paginationPageSize={50}
  serverSideDataSource={dataSource}
/>
```

---

## 覆盖层（Overlays）

### 加载中

```tsx
<FiboGrid
  loading={isLoading}
  loadingOverlayComponent={<MeuSpinner />}
/>
```

### 无数据

```tsx
<FiboGrid
  rowData={[]}
  noRowsOverlayComponent={<p>Nenhum resultado encontrado</p>}
/>
```

---

## 虚拟化的值过滤器

对于具有大量唯一值的列，在过滤器中启用虚拟化。

```tsx
<FiboGrid
  enableFilterValueVirtualization
  filterValues={{
    status: ['ativo', 'inativo', 'pendente'],
    tipo: ['A', 'B', 'C'],
  }}
/>
```
