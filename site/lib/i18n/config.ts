export const locales = ["en", "pt", "es", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
  zh: "中文",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  pt: "pt-BR",
  es: "es",
  zh: "zh-CN",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localizedPath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}
