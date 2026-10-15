export {
  defaultLocale,
  isLocale,
  localeHtmlLang,
  localeLabels,
  localizedPath,
  locales,
  type Locale,
} from "./config";
export { getDictionary } from "./get-dictionary";
export type { Dictionary } from "./dictionaries/en";
export { docTitles, localizedDocTitle } from "./doc-titles";
export { useLocale, useT } from "./locale-context";
