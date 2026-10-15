import type { DocIndexEntry } from "./types";

export const DOC_LIBRARY: DocIndexEntry[] = [
  {
    num: "01",
    title: "System Overview & Capabilities",
    desc: "Fibonacci spatial architecture, core props, and dual-axis virtualization.",
    tag: "OVERVIEW",
    href: "/docs/01-overview",
  },
  {
    num: "02",
    title: "TypeScript Types & Column Contracts",
    desc: "ColumnDef, RowNode, GridIngress, GridEgress, and strongly-typed cell contracts.",
    tag: "TYPES",
    href: "/docs/02-types",
  },
  {
    num: "03",
    title: "Virtualization & State Hooks",
    desc: "useFiboGrid, useVirtualizer, useGridSortFilter, and useCellSelection.",
    tag: "HOOKS",
    href: "/docs/03-hooks",
  },
  {
    num: "04",
    title: "Components & Special Renderers",
    desc: "GridToolbar, FilterPopover, ColumnPanel, StatusBadge, and ProgressBar.",
    tag: "COMPONENTS",
    href: "/docs/04-components",
  },
  {
    num: "05",
    title: "Imperative GridApi & Manager",
    desc: "Transactional manager().upAdd().update().remove().execute() and params().",
    tag: "API",
    href: "/docs/05-api",
  },
  {
    num: "06",
    title: "Ingress/Egress, Registry & Grouping",
    desc: "GridRegistryProvider, Ingress/Egress security rules, grouping, and server-side.",
    tag: "ADVANCED",
    href: "/docs/06-advanced",
  },
  {
    num: "07",
    title: "Quick Start & Installation",
    desc: "Zero-config setup for Next.js App Router, Vite, and TypeScript 5.",
    tag: "GUIDE",
    href: "/docs/guides/usage",
  },
  {
    num: "08",
    title: "CSS Variable Matrix & Themes",
    desc: "Customizing --fibogrid-* tokens, Noir Dark, Uber, Apple, and Excel.",
    tag: "THEMING",
    href: "/docs/guides/theming",
  },
  {
    num: "09",
    title: "Architecture Patterns & Recipes",
    desc: "Master-detail grids, real-time streaming updates, and enterprise workflows.",
    tag: "PATTERNS",
    href: "/docs/08-patterns",
  },
  {
    num: "10",
    title: "Complete Documentation Index",
    desc: "Browse all 15 engineering chapters and API specifications.",
    tag: "ALL DOCS",
    href: "/docs",
  },
];
