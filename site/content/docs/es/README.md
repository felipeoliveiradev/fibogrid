# FiboGrid — Documentación completa

Componente React de data grid de alto rendimiento inspirado en la elegancia matemática (Fibonacci). Virtual scrolling para más de 100k filas a 60fps, seguridad Ingress/Egress, API fluida y arquitectura headless.

Import path: `fibogrid`
Versión: 1.0.30

---

## Índice general

| # | Sección | Descripción |
|---|-------|-----------|
| [01](./01-overview/README.md) | **Overview y arquitectura** | Visión general, estructura de archivos, flujo de datos |
| [02](./02-types/README.md) | **Sistema de tipos** | ColumnDef, RowNode, GridState, FilterModel, SortModel, Events |
| [03](./03-hooks/README.md) | **Hooks** | useFiboGrid, useGridState, useVirtualization, useColumnResize y más |
| [04](./04-components/README.md) | **Componentes** | FiboGrid, GridToolbar, GridStatusBar, GridHeader, GridRow, GridCell |
| [05](./05-api/README.md) | **Grid API** | GridApi, GridApiBuilder (fluent), GridManagerBuilder, EventBuilder |
| [06](./06-advanced/README.md) | **Recursos avanzados** | Grid Registry, Ingress/Egress, Grouping, Tree Data, Server-Side |
| [07](./07-configuration/README.md) | **Configuración** | FiboGridConfigs, Temas, CSS Variables, Densidad |
| [08](./08-patterns/README.md) | **Patrones de uso** | Convenciones, estructura de proyecto, buenas prácticas |
| [09](./09-localization/README.md) | **Localización** | 9 idiomas, FiboGridLocale, traducciones personalizadas |
| [10](./10-examples/README.md) | **Ejemplos** | Grid básico, edición inline, master-detail, server-side, export |
| [11](./11-integration/README.md) | **Integración** | Guía rápida por caso de uso, integración con Claude Code |
| [guides/usage](./guides/usage.md) | **Usage (TS)** | Ejemplos TypeScript de uso de la API |
| [guides/theming](./guides/theming.md) | **Theming** | Temas, CSS variables y apariencia |

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

| Tecnología | Papel |
|------------|-------|
| React 18+ | Renderizado y hooks |
| TypeScript | Tipado completo |
| Tailwind CSS | Estilos y temas |
| Radix UI | Componentes base (popover, select, dialog) |
| Vite | Build y bundling |
| XLSX | Export a Excel |
| Lucide React | Iconos |
| Recharts | Gráficos (demo) |

## Estadísticas

| Métrica | Valor |
|---------|-------|
| Componentes internos | 16+ |
| Hooks personalizados | 15+ |
| Tipos de evento | 15+ |
| Locales soportados | 9 |
| Tipos de editor | 7 |
| Tipos de filtro | 5 |
| Funciones de agregación | 5 + custom |

## Build Outputs

| Formato | Archivo |
|---------|----------|
| ES Module | `dist/fibogrid.es.js` |
| UMD | `dist/fibogrid.umd.js` |
| CSS | `dist/style.css` |
| Types | `dist/index.d.ts` |
