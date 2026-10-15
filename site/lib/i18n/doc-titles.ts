import type { Locale } from "./config";

/** Canonical slug path → localized chapter title (sidebar / index / H1). */
export const docTitles: Record<string, Record<Locale, string>> = {
  "01-overview": {
    en: "Overview & Architecture",
    pt: "Overview & Arquitetura",
    es: "Overview y arquitectura",
    zh: "概览与架构",
  },
  "02-types": {
    en: "Type System",
    pt: "Sistema de Tipos",
    es: "Sistema de tipos",
    zh: "类型系统",
  },
  "03-hooks": {
    en: "Hooks",
    pt: "Hooks",
    es: "Hooks",
    zh: "Hooks",
  },
  "04-components": {
    en: "Components",
    pt: "Componentes",
    es: "Componentes",
    zh: "组件",
  },
  "04-components/special-renderers": {
    en: "Special Renderers",
    pt: "Renderers especiais",
    es: "Renderers especiales",
    zh: "特殊渲染器",
  },
  "05-api": {
    en: "Grid API",
    pt: "Grid API",
    es: "Grid API",
    zh: "Grid API",
  },
  "05-api/utils": {
    en: "Utility Functions",
    pt: "Funções utilitárias",
    es: "Funciones utilitarias",
    zh: "工具函数",
  },
  "06-advanced": {
    en: "Advanced Features",
    pt: "Recursos avançados",
    es: "Funciones avanzadas",
    zh: "高级功能",
  },
  "07-configuration": {
    en: "Configuration",
    pt: "Configuração",
    es: "Configuración",
    zh: "配置",
  },
  "08-patterns": {
    en: "Usage Patterns",
    pt: "Padrões de uso",
    es: "Patrones de uso",
    zh: "使用模式",
  },
  "09-localization": {
    en: "Localization",
    pt: "Localização",
    es: "Localización",
    zh: "本地化",
  },
  "10-examples": {
    en: "Examples",
    pt: "Exemplos",
    es: "Ejemplos",
    zh: "示例",
  },
  "11-integration": {
    en: "Integration",
    pt: "Integração",
    es: "Integración",
    zh: "集成",
  },
  "guides/theming": {
    en: "Theming Guide",
    pt: "Guia de temas",
    es: "Guía de temas",
    zh: "主题指南",
  },
  "guides/usage": {
    en: "TypeScript Usage Examples",
    pt: "Exemplos de uso TypeScript",
    es: "Ejemplos de uso TypeScript",
    zh: "TypeScript 使用示例",
  },
};

export function localizedDocTitle(
  slug: string[],
  locale: Locale,
  fallback: string,
): string {
  const key = slug.join("/");
  return docTitles[key]?.[locale] ?? fallback;
}
