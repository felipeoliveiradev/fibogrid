# 01 - 概览与架构

## 位置

```
src/components/FiboGrid/
```

## 文件结构

```
src/
├── index.ts                              # 入口 — 重新导出公共 API
├── components/
│   └── FiboGrid/
│       ├── FiboGrid.tsx                  # 主组件（1023 行）
│       ├── types.ts                      # 所有 TypeScript 类型
│       ├── index.ts                      # Barrel 导出
│       ├── components/                   # 子组件
│       │   ├── GridHeader.tsx            # 带排序的列头
│       │   ├── GridRow.tsx               # 支持虚拟化的单行
│       │   ├── GridCell.tsx              # 带 editors/renderers 的单元格
│       │   ├── GroupRow.tsx              # 带聚合的分组行
│       │   ├── GridToolbar.tsx           # 工具栏（搜索、过滤、导出、列）
│       │   ├── GridFooter.tsx            # 页脚
│       │   ├── GridPagination.tsx        # 分页控件
│       │   ├── GridStatusBar.tsx         # 状态栏（计数、选择、聚合）
│       │   ├── GridOverlay.tsx           # 加载/空数据覆盖层
│       │   ├── ColumnMenu.tsx            # 列上下文菜单
│       │   ├── ColumnPanel.tsx           # 列可见性/顺序面板
│       │   ├── FilterPanel.tsx           # 高级过滤 UI
│       │   ├── FilterPopover.tsx         # 值选择弹出层
│       │   ├── ContextMenu.tsx           # 上下文菜单（右键）
│       │   ├── VirtualFilterList.tsx     # 虚拟化过滤列表
│       │   └── SpecialRenderers.tsx      # 内置 Renderers
│       ├── context/
│       │   ├── GridContext.tsx            # GridProvider + useGridContext
│       │   └── GridRegistryContext.tsx    # GridRegistryProvider（多表格）
│       ├── hooks/
│       │   ├── useFiboGrid.ts            # 主 Hook — 从外部访问表格
│       │   ├── useGridState.ts           # 完整状态编排器
│       │   ├── useVirtualization.ts      # 虚拟滚动（10 万+ 行）
│       │   ├── useColumnResize.ts        # 调整列宽
│       │   ├── useColumnDrag.ts          # 列拖放
│       │   ├── useRowDrag.ts             # 行拖放
│       │   ├── useRangeSelection.ts      # 单元格范围选择（Excel 风格）
│       │   ├── useRowRangeSelection.ts   # 行范围选择
│       │   ├── useKeyboardNavigation.ts  # 键盘导航 + 快捷键
│       │   ├── useGrouping.ts            # 行分组
│       │   ├── useCellSelection.ts       # 单个单元格选择
│       │   ├── useUndoRedo.ts            # Undo/Redo（最多 50 条历史）
│       │   ├── useFillHandle.ts          # 用于扩展选区的填充柄
│       │   ├── useGridEvents.ts          # 表格事件订阅
│       │   ├── useServerSideData.ts      # 服务端数据加载
│       │   └── grid-state/              # 内部状态子 Hooks
│       │       ├── useGridEventSystem.ts
│       │       ├── useGridColumns.ts
│       │       ├── useGridSortFilter.ts
│       │       ├── useGridPaginationState.ts
│       │       ├── useGridPaginationInfo.ts
│       │       ├── useGridRows.ts
│       │       ├── useGridSelection.ts
│       │       ├── useGridEditing.ts
│       │       ├── useGridApi.ts
│       │       └── useClickDetector.ts
│       ├── utils/
│       │   ├── helpers.ts                # generateRowId, createRowNode, processColumns, sortRows, filterRows
│       │   ├── EventBuilder.ts           # 带订阅的事件系统
│       │   ├── excelExport.ts            # 导出为 Excel（XLSX）
│       │   ├── grouping.ts              # groupRowsByFields、聚合
│       │   ├── shortcuts.ts             # 键盘快捷键系统
│       │   └── permissionValidator.ts   # Ingress/Egress 校验
│       ├── locales/                      # 9 个语言文件
│       │   ├── types.ts                  # FiboGridLocale 接口
│       │   ├── enUS.ts
│       │   ├── ptBR.ts
│       │   ├── frFR.ts
│       │   ├── jaJP.ts
│       │   ├── zhCN.ts
│       │   ├── ruRU.ts
│       │   ├── esES.ts
│       │   ├── caES.ts
│       │   └── koKR.ts
│       ├── constants/
│       │   └── permissions.ts            # GridPermissions（Manager、API、Events）
│       └── styles/
│           ├── theme.css                 # CSS 变量（浅色 + 深色）
│           └── lib.css                   # 基础样式
├── ui/                                   # shadcn/ui 组件（40+）
├── pages/                                # 演示页面
├── examples/                             # 实现示例
└── lib/                                  # 通用工具
```

## 架构

```
FiboGrid<T>（主组件）
        ↓
   useGridState（状态编排器）
        ↓
┌───────────────────────────────────────────────┐
│  useGridColumns      → 列处理                  │
│  useGridSortFilter   → 排序 + 过滤 + 快速搜索   │
│  useGridRows         → 行 + 服务端              │
│  useGridSelection    → 单选/多选/范围选择       │
│  useGridPagination   → 客户端/服务端分页        │
│  useGridEditing      → 行内编辑 + undo          │
│  useGridEventSystem  → 事件发布/订阅            │
│  useGrouping         → 分组 + 聚合              │
└───────────────────────────────────────────────┘
        ↓
useGridApi → 组装带有全部方法的 GridApi<T>
        ↓
GridApiBuilder (fluent)  +  GridManagerBuilder (CRUD)
        ↓
GridRegistryProvider → 表格之间的通信
```

## 数据流

```
1. FiboGridProps 接收 rowData、columnDefs 和配置
2. useGridState 编排所有状态子 Hooks
3. useGridColumns 处理列（flex、width、pin、order）
4. useGridRows 创建带唯一 ID 的 RowNode<T>[]
5. useGridSortFilter 对 RowNodes 应用排序和过滤
6. useGridPagination 按页切分行
7. useVirtualization 仅渲染视口内可见的行
8. useGridApi 组装带有全部方法的公共 API
9. GridRegistryProvider 注册表格以支持多表格通信
10. EventBuilder 向内部和外部监听器发出事件
```

## 公共 API（fibogrid 的导出）

### 主要
- `FiboGrid` — 主组件
- `GridProvider`、`useGridContext`
- `GridRegistryProvider`、`useGridRegistry`、`useGridEvent`

### Hooks
- `useFiboGrid`、`useGridState`、`useGridEvents`
- `useVirtualization`、`useColumnResize`、`useColumnDrag`、`useRowDrag`

### 组件
- `GridToolbar`、`GridStatusBar`、`ColumnMenu`、`GroupRow`、`ColumnPanel`、`FilterPanel`

### 工具函数
- `exportToExcel`、`EventBuilder`
- `generateRowId`、`createRowNode`、`processColumns`、`sortRows`、`filterRows`
- `groupRowsByFields`

### Locales
- `enUS`、`ptBR`、`frFR`、`jaJP`、`zhCN`、`ruRU`、`esES`、`caES`、`koKR`

### 类型
- 全部通过 `export * from './types'` 导出
