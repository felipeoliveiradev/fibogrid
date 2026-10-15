# 05 - Funcoes Utilitarias

## Localizacao

```
src/components/FiboGrid/utils/
```

---

## helpers.ts

### generateRowId

Gera ou extrai ID unico para uma linha.

```typescript
function generateRowId<T>(data: T, index: number, getRowId?: (data: T) => string): string
```

- Se `getRowId` fornecido, usa-o
- Senao, usa `data.id` se existir
- Senao, gera ID baseado no indice

### createRowNode

Cria um `RowNode<T>` a partir de dados raw.

```typescript
function createRowNode<T>(data: T, index: number, getRowId?: (data: T) => string): RowNode<T>
```

Retorna: `{ id, data, rowIndex, selected: false }`

### processColumns

Calcula larguras e posicoes de colunas (flex layout).

```typescript
function processColumns<T>(
  columns: ColumnDef<T>[],
  containerWidth: number,
  defaultColDef?: Partial<ColumnDef<T>>
): ProcessedColumn<T>[]
```

- Mescla `defaultColDef` com cada coluna
- Calcula `flex` proporcional ao espaco restante
- Respeita `minWidth` e `maxWidth`
- Calcula `left` (posicao horizontal acumulada)
- Define `computedWidth` final

### sortRows

Aplica ordenacao multi-coluna aos rows.

```typescript
function sortRows<T>(
  rows: RowNode<T>[],
  sortModel: SortModel[],
  columns: ColumnDef<T>[]
): RowNode<T>[]
```

- Suporta multiplas colunas com prioridade por ordem
- Usa `comparator` customizado da coluna se definido
- Fallback para `defaultComparator`

### filterRows

Aplica filtros compostos e quick filter.

```typescript
function filterRows<T>(
  rows: RowNode<T>[],
  filterModel: FilterModel[],
  columns: ColumnDef<T>[],
  quickFilterText?: string
): RowNode<T>[]
```

- Todos os filtros sao AND (todas as condicoes devem ser verdadeiras)
- Quick filter pesquisa em todos os campos
- Usa `filterComparator` customizado se definido na coluna
- Usa `useInternalFilter` da coluna se definido

### fastComparator

Comparacao rapida para tipos primitivos.

```typescript
function fastComparator(a: any, b: any): number
```

### defaultComparator

Comparacao padrao com suporte a Date, string e numeros.

```typescript
function defaultComparator(a: any, b: any): number
```

- Trata `null/undefined` como menores
- Converte `Date` para timestamp
- Strings comparadas case-insensitive

### getValueFromPath

Acesso profundo a propriedades com notacao de ponto.

```typescript
function getValueFromPath(obj: any, path: string): any
```

```typescript
getValueFromPath({ a: { b: { c: 42 } } }, 'a.b.c'); // 42
getValueFromPath({ items: [1, 2] }, 'items.0');      // 1
```

### setValueAtPath

Definir valor profundo com notacao de ponto.

```typescript
function setValueAtPath<T>(obj: T, path: string, value: any): T
```

Retorna novo objeto (imutavel).

---

## grouping.ts

### isGroupNode

Type guard para verificar se um nodo e um grupo.

```typescript
function isGroupNode<T>(node: GroupableRowNode<T>): node is GroupRowNode<T>
```

### groupRowsByFields

Agrupa linhas por um ou mais campos com agregacoes.

```typescript
function groupRowsByFields<T>(
  rows: RowNode<T>[],
  groupFields: string[],
  aggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: any[]) => any)>
): GroupableRowNode<T>[]
```

- Agrupamento hierarquico (multi-nivel)
- Calcula agregacoes por grupo
- Cada grupo tem `children` com os rows do grupo

### splitRowsByField

Divide linhas por campo — cria separadores visuais sem hierarquia.

```typescript
function splitRowsByField<T>(rows: RowNode<T>[], splitField: string): GroupableRowNode<T>[]
```

### addChildRows

Adiciona filhos a uma linha pai (tree data).

```typescript
function addChildRows<T>(
  rows: RowNode<T>[],
  parentId: string,
  childData: T[],
  getRowId?: (data: T) => string
): RowNode<T>[]
```

### flattenGroupedRows

Aplaina a hierarquia de grupos considerando o estado de expansao.

```typescript
function flattenGroupedRows<T>(
  groupedRows: GroupableRowNode<T>[],
  expandedGroups: Set<string>
): GroupableRowNode<T>[]
```

- Grupos colapsados nao incluem filhos
- Grupos expandidos incluem filhos recursivamente

### Tipos de Grouping

```typescript
interface GroupRowNode<T> {
  id: string;
  groupField: string;
  groupValue: any;
  children: GroupableRowNode<T>[];
  aggregations: Record<string, any>;
  level: number;
  expanded: boolean;
  rowCount: number;
}

interface RegularRowNode<T> extends RowNode<T> {
  level: number;
}

type GroupableRowNode<T> = GroupRowNode<T> | RegularRowNode<T>;
```

---

## shortcuts.ts

### isShortcutMatch

Verifica se um evento de teclado corresponde a um atalho definido.

```typescript
function isShortcutMatch(event: KeyboardEvent | React.KeyboardEvent, shortcut: ShortcutDef): boolean
```

- Suporta combinacoes: `Ctrl+A`, `Meta+A`, `Shift+Tab`
- Suporta multiplas combinacoes por atalho: `['Ctrl+A', 'Meta+A']`
- Case-insensitive

### defaultShortcuts

10 atalhos built-in ativados quando `shortcuts={true}`.

```typescript
const defaultShortcuts: ShortcutDef[] = [
  { id: 'nav-up',      keys: 'ArrowUp',    action: navegar linha acima },
  { id: 'nav-down',    keys: 'ArrowDown',  action: navegar linha abaixo },
  { id: 'nav-left',    keys: 'ArrowLeft',  action: navegar celula esquerda },
  { id: 'nav-right',   keys: 'ArrowRight', action: navegar celula direita },
  { id: 'nav-tab',     keys: 'Tab',        action: proxima celula },
  { id: 'nav-tab-rev', keys: 'Shift+Tab',  action: celula anterior },
  { id: 'edit-enter',  keys: ['Enter', 'F2'], action: iniciar/confirmar edicao },
  { id: 'select-all',  keys: ['Ctrl+A', 'Meta+A'], action: selecionar tudo },
  { id: 'copy',        keys: ['Ctrl+C', 'Meta+C'], action: copiar para clipboard },
  { id: 'paste',       keys: ['Ctrl+V', 'Meta+V'], action: colar do clipboard },
  { id: 'undo',        keys: ['Ctrl+Z', 'Meta+Z'], action: desfazer },
];
```

---

## excelExport.ts

### exportToExcel

Export basico para Excel (.xlsx).

```typescript
function exportToExcel<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params?: ExportParams
): void
```

### exportToExcelWithStyles

Export para Excel com estilos opcionais.

```typescript
function exportToExcelWithStyles<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params?: ExcelExportParams
): void
```

### ExcelExportParams

```typescript
interface ExcelExportParams extends ExportParams {
  sheetName?: string;
  headerStyle?: Record<string, any>;
  cellStyle?: Record<string, any>;
}
```

---

## EventBuilder.ts

Ver secao `05-api/README.md` para documentacao completa do EventBuilder.

---

## permissionValidator.ts

### validateIngress

Valida se uma acao e permitida por regras de ingress.

```typescript
function validateIngress(
  ingress: GridIngress[] | undefined,
  origin: string,
  action: string
): boolean
```

### Logica de Validacao

1. Se `ingress` nao definido → permite tudo
2. Se `ingress` definido mas vazio → bloqueia tudo (Deny All)
3. Procura regra para o `origin`
4. Verifica wildcards: `'*'`, `'api.*'`, `'manager.*'`
5. Verifica permissao especifica
6. Se bloqueado → emite `console.warn` com detalhes

---

## CSS (Estilos)

### Localizacao

```
src/components/FiboGrid/styles/
```

### Ficheiros

| Ficheiro | Tamanho | Descricao |
|----------|---------|-----------|
| `core.css` | ~17KB | Layout base: grid, celulas, linhas, cabecalhos, scroll, pinned, resize |
| `theme.css` | ~80KB | Variaveis CSS completas: light mode + dark mode + todos os estados |
| `theme-mapping.css` | ~2.6KB | Mapeamento de variaveis CSS para componentes |
| `lib.css` | ~1KB | Imports e entry point para build da lib |
| `index.css` | ~1KB | Entry point para o app de demo |

### Variaveis CSS Principais (80+)

Organizadas por categoria:

- **Cores base**: bg, surface, text, text-secondary, text-muted, primary, border
- **Celulas**: cell-bg, cell-border, cell-padding, cell-text
- **Linhas**: row-hover, row-selected, row-stripe, row-height
- **Cabecalhos**: header-bg, header-text, header-height, header-border
- **Botoes**: button-bg, button-hover, button-active, button-text
- **Inputs**: input-bg, input-border, input-focus, input-text
- **Scrollbar**: scrollbar-track, scrollbar-thumb, scrollbar-width
- **Sombras**: shadow-sm, shadow-md, shadow-lg
- **Z-index**: popover, select, modal, overlay, header, pinned
- **Pinned**: pinned-bg, pinned-shadow, pinned-border
- **Drag**: drag-bg, drag-border, drag-indicator
- **Filtros**: filter-bg, filter-active, filter-badge
- **Paginacao**: pagination-bg, pagination-active, pagination-disabled
