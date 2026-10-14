# FiboGrid — Documentacao Completa

Componente React de data grid de alta performance inspirado na elegancia matematica (Fibonacci). Virtual scrolling para 100k+ linhas a 60fps, seguranca Ingress/Egress, API fluente e arquitetura headless.

Import path: `fibogrid`
Versao: 1.0.30

---

## Indice Geral

| # | Secao | Descricao |
|---|-------|-----------|
| [01](./01-overview/README.md) | **Overview & Arquitetura** | Visao geral, estrutura de ficheiros, fluxo de dados |
| [02](./02-types/README.md) | **Sistema de Tipos** | ColumnDef, RowNode, GridState, FilterModel, SortModel, Events |
| [03](./03-hooks/README.md) | **Hooks** | useFiboGrid, useGridState, useVirtualization, useColumnResize e mais |
| [04](./04-components/README.md) | **Componentes** | FiboGrid, GridToolbar, GridStatusBar, GridHeader, GridRow, GridCell |
| [05](./05-api/README.md) | **Grid API** | GridApi, GridApiBuilder (fluent), GridManagerBuilder, EventBuilder |
| [06](./06-advanced/README.md) | **Recursos Avancados** | Grid Registry, Ingress/Egress, Grouping, Tree Data, Server-Side |
| [07](./07-configuration/README.md) | **Configuracao** | FiboGridConfigs, Temas, CSS Variables, Densidade |
| [08](./08-patterns/README.md) | **Padroes de Uso** | Convencoes, estrutura de projeto, boas praticas |
| [09](./09-localization/README.md) | **Localizacao** | 9 idiomas, FiboGridLocale, traducoes customizadas |
| [10](./10-examples/README.md) | **Exemplos** | Grid basico, edicao inline, master-detail, server-side, export |
| [11](./11-integration/README.md) | **Integracao** | Guia rapido por caso de uso, integracao com Claude Code |
| [guides/usage](./guides/usage.md) | **Usage (TS)** | Exemplos TypeScript de uso da API |
| [guides/theming](./guides/theming.md) | **Theming** | Temas, CSS variables e aparencia |

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

| Tecnologia | Papel |
|------------|-------|
| React 18+ | Renderizacao e hooks |
| TypeScript | Tipagem completa |
| Tailwind CSS | Estilos e temas |
| Radix UI | Componentes base (popover, select, dialog) |
| Vite | Build e bundling |
| XLSX | Export para Excel |
| Lucide React | Icones |
| Recharts | Graficos (demo) |

## Estatisticas

| Metrica | Valor |
|---------|-------|
| Componentes internos | 16+ |
| Hooks customizados | 15+ |
| Tipos de evento | 15+ |
| Locales suportados | 9 |
| Tipos de editor | 7 |
| Tipos de filtro | 5 |
| Funcoes de agregacao | 5 + custom |

## Build Outputs

| Formato | Ficheiro |
|---------|----------|
| ES Module | `dist/fibogrid.es.js` |
| UMD | `dist/fibogrid.umd.js` |
| CSS | `dist/style.css` |
| Types | `dist/index.d.ts` |
