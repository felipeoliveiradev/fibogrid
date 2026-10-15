import fs from "node:fs";
import path from "node:path";
import {
  defaultLocale,
  localizedDocTitle,
  localizedPath,
  type Locale,
} from "@/lib/i18n";

export type DocEntry = {
  slug: string[];
  title: string;
  href: string;
};

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

type WalkHit = { slug: string[]; rawTitle: string };

function localeRoot(locale: Locale): string {
  const preferred = path.join(DOCS_ROOT, locale);
  if (fs.existsSync(preferred)) return preferred;
  const fallback = path.join(DOCS_ROOT, defaultLocale);
  if (fs.existsSync(fallback)) return fallback;
  // legacy flat layout
  return DOCS_ROOT;
}

function walk(dir: string, base: string[] = []): WalkHit[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out: WalkHit[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (
      base.length === 0 &&
      entry.isDirectory() &&
      ["en", "pt", "es", "zh"].includes(entry.name)
    ) {
      continue;
    }
    const next = [...base, entry.name];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, next));
      continue;
    }
    if (!entry.name.endsWith(".md")) continue;
    const slug =
      entry.name.toLowerCase() === "readme.md"
        ? base
        : [...base, entry.name.replace(/\.md$/i, "")];
    if (slug.length === 0) continue;
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ full, "utf8");
    const rawTitle =
      raw
        .split("\n")
        .find((line) => line.startsWith("# "))
        ?.replace(/^#\s+/, "")
        .trim() || slug[slug.length - 1]!;
    out.push({ slug, rawTitle });
  }

  return out;
}

export function listDocs(locale: Locale = defaultLocale): DocEntry[] {
  return walk(localeRoot(locale))
    .map(({ slug, rawTitle }) => ({
      slug,
      title: localizedDocTitle(slug, locale, rawTitle),
      href: localizedPath(locale, `/docs/${slug.join("/")}`),
    }))
    .sort((a, b) => a.href.localeCompare(b.href));
}

function resolveDocFileForLocale(
  slug: string[],
  locale: Locale,
): string | null {
  if (slug.length === 0) return null;

  const roots = [
    path.join(DOCS_ROOT, locale),
    path.join(DOCS_ROOT, defaultLocale),
    DOCS_ROOT,
  ];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const asFile = path.join(root, ...slug) + ".md";
    if (fs.existsSync(asFile)) return asFile;
    const asReadme = path.join(root, ...slug, "README.md");
    if (fs.existsSync(asReadme)) return asReadme;
  }
  return null;
}

export function resolveDocFile(slug: string[]): string | null {
  return resolveDocFileForLocale(slug, defaultLocale);
}

export function readDoc(
  slug: string[],
  locale: Locale = defaultLocale,
): { title: string; content: string } | null {
  const file = resolveDocFileForLocale(slug, locale);
  if (!file) return null;
  const raw = fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8");
  const rawTitle =
    raw
      .split("\n")
      .find((line) => line.startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim() || slug.join(" / ");
  const title = localizedDocTitle(slug, locale, rawTitle);
  const content = raw.replace(/^#\s+[^\n]+\n+/, "");
  return { title, content };
}
