# FiboGrid — 完整文档

受数学之美（斐波那契）启发的高性能 React 数据表格组件。支持 10 万+ 行数据 60fps 虚拟滚动、Ingress/Egress 安全机制、流式（fluent）API 以及 headless 架构。

导入路径：`fibogrid`
版本：1.0.30

---

## 总目录

| # | 章节 | 说明 |
|---|------|------|
| [01](./01-overview/README.md) | **概览与架构** | 总体介绍、文件结构、数据流 |
| [02](./02-types/README.md) | **类型系统** | ColumnDef、RowNode、GridState、FilterModel、SortModel、Events |
| [03](./03-hooks/README.md) | **Hooks** | useFiboGrid、useGridState、useVirtualization、useColumnResize 等 |
| [04](./04-components/README.md) | **组件** | FiboGrid、GridToolbar、GridStatusBar、GridHeader、GridRow、GridCell |
| [05](./05-api/README.md) | **Grid API** | GridApi、GridApiBuilder（fluent）、GridManagerBuilder、EventBuilder |
| [06](./06-advanced/README.md) | **高级功能** | Grid Registry、Ingress/Egress、分组、树形数据、服务端 |
| [07](./07-configuration/README.md) | **配置** | FiboGridConfigs、主题、CSS 变量、密度 |
| [08](./08-patterns/README.md) | **使用模式** | 约定、项目结构、最佳实践 |
| [09](./09-localization/README.md) | **本地化** | 9 种语言、FiboGridLocale、自定义翻译 |
| [10](./10-examples/README.md) | **示例** | 基础表格、行内编辑、主从表、服务端、导出 |
| [11](./11-integration/README.md) | **集成** | 按使用场景的快速指南、与 Claude Code 集成 |
| [guides/usage](./guides/usage.md) | **用法（TS）** | API 的 TypeScript 用法示例 |
| [guides/theming](./guides/theming.md) | **主题** | 主题、CSS 变量与外观 |

---

## 快速开始

```tsx
import { FiboGrid } from 'fibogrid';
import 'fibogrid/styles.css';

const columnDefs = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'nome', headerName: 'Nome', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
];

const rowData = [
  { id: 1, nome: 'João', email: 'joao@email.com' },
  { id: 2, nome: 'Maria', email: 'maria@email.com' },
];

<FiboGrid
  rowData={rowData}
  columnDefs={columnDefs}
  getRowId={(row) => String(row.id)}
  pagination
  paginationPageSize={20}
  showToolbar
  showStatusBar
/>
```

---

## 技术栈

| 技术 | 作用 |
|------|------|
| React 18+ | 渲染与 hooks |
| TypeScript | 完整类型支持 |
| Tailwind CSS | 样式与主题 |
| Radix UI | 基础组件（popover、select、dialog） |
| Vite | 构建与打包 |
| XLSX | 导出为 Excel |
| Lucide React | 图标 |
| Recharts | 图表（演示） |

## 统计数据

| 指标 | 数值 |
|------|------|
| 内部组件 | 16+ |
| 自定义 Hooks | 15+ |
| 事件类型 | 15+ |
| 支持的 locale | 9 |
| 编辑器类型 | 7 |
| 过滤器类型 | 5 |
| 聚合函数 | 5 + 自定义 |

## 构建产物

| 格式 | 文件 |
|------|------|
| ES Module | `dist/fibogrid.es.js` |
| UMD | `dist/fibogrid.umd.js` |
| CSS | `dist/style.css` |
| Types | `dist/index.d.ts` |
