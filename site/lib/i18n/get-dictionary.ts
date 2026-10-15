import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { pt } from "./dictionaries/pt";
import { zh } from "./dictionaries/zh";

const map: Record<Locale, Dictionary> = { en, pt, es, zh };

export function getDictionary(locale: Locale): Dictionary {
  return map[locale] ?? en;
}
