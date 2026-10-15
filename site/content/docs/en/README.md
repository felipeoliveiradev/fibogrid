# FiboGrid — Complete Documentation

High-performance React data grid component inspired by mathematical elegance (Fibonacci). Virtual scrolling for 100k+ rows at 60fps, Ingress/Egress security, fluent API, and headless architecture.

Import path: `fibogrid`
Version: 1.0.30

---

## Table of Contents

| # | Section | Description |
|---|---------|-------------|
| [01](./01-overview/README.md) | **Overview & Architecture** | Overview, file structure, data flow |
| [02](./02-types/README.md) | **Type System** | ColumnDef, RowNode, GridState, FilterModel, SortModel, Events |
| [03](./03-hooks/README.md) | **Hooks** | useFiboGrid, useGridState, useVirtualization, useColumnResize and more |
| [04](./04-components/README.md) | **Components** | FiboGrid, GridToolbar, GridStatusBar, GridHeader, GridRow, GridCell |
| [05](./05-api/README.md) | **Grid API** | GridApi, GridApiBuilder (fluent), GridManagerBuilder, EventBuilder |
| [06](./06-advanced/README.md) | **Advanced Features** | Grid Registry, Ingress/Egress, Grouping, Tree Data, Server-Side |
| [07](./07-configuration/README.md) | **Configuration** | FiboGridConfigs, Themes, CSS Variables, Density |
| [08](./08-patterns/README.md) | **Usage Patterns** | Conventions, project structure, best practices |
| [09](./09-localization/README.md) | **Localization** | 9 languages, FiboGridLocale, custom translations |
| [10](./10-examples/README.md) | **Examples** | Basic grid, inline editing, master-detail, server-side, export |
| [11](./11-integration/README.md) | **Integration** | Quick guide by use case, Claude Code integration |
| [guides/usage](./guides/usage.md) | **Usage (TS)** | TypeScript examples of API usage |
| [guides/theming](./guides/theming.md) | **Theming** | Themes, CSS variables, and appearance |

---

## Quick Start

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

## Stack

| Technology | Role |
|------------|------|
| React 18+ | Rendering and hooks |
| TypeScript | Full typing |
| Tailwind CSS | Styles and themes |
| Radix UI | Base components (popover, select, dialog) |
| Vite | Build and bundling |
| XLSX | Excel export |
| Lucide React | Icons |
| Recharts | Charts (demo) |

## Statistics

| Metric | Value |
|--------|-------|
| Internal components | 16+ |
| Custom hooks | 15+ |
| Event types | 15+ |
| Supported locales | 9 |
| Editor types | 7 |
| Filter types | 5 |
| Aggregation functions | 5 + custom |

## Build Outputs

| Format | File |
|--------|------|
| ES Module | `dist/fibogrid.es.js` |
| UMD | `dist/fibogrid.umd.js` |
| CSS | `dist/style.css` |
| Types | `dist/index.d.ts` |
