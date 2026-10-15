import type { Dictionary } from "@/lib/i18n";
import type { DocsChapter, DocsSection } from "../Models";

export const padChapter = (n: number) => String(n).padStart(2, "0");

/** Strip leading "01 - " / "FiboGrid - " from markdown H1s for clean UI titles. */
export function displayChapterTitle(title: string): string {
  return title
    .replace(/^\d+\s*[-–—.]\s*/, "")
    .replace(/^FiboGrid\s*[-–—:]?\s*/i, "")
    .trim();
}

function titleCaseFromSlug(root: string): string {
  const cleaned = root.replace(/^\d+-/, "").replace(/-/g, " ");
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function sectionLabelFromSlug(
  root: string,
  sections?: Dictionary["docs"]["sections"],
): string {
  if (sections) {
    const hit = sections[root as keyof typeof sections];
    if (hit) return hit;
  }
  return titleCaseFromSlug(root);
}

export function groupDocsChapters(
  chapters: DocsChapter[],
  sections?: Dictionary["docs"]["sections"],
): DocsSection[] {
  const map = new Map<string, DocsChapter[]>();
  for (const chapter of chapters) {
    const id = chapter.slug[0] ?? "general";
    const list = map.get(id) ?? [];
    list.push(chapter);
    map.set(id, list);
  }
  return [...map.entries()].map(([id, items]) => ({
    id,
    label: sectionLabelFromSlug(id, sections),
    items,
  }));
}

export function findChapterIndex(chapters: DocsChapter[], href: string): number {
  return chapters.findIndex((c) => c.href === href);
}

export function adjacentChapters(
  chapters: DocsChapter[],
  currentHref: string,
): { prev?: DocsChapter; next?: DocsChapter; index: number } {
  const index = findChapterIndex(chapters, currentHref);
  if (index < 0) return { index: -1 };
  return {
    index,
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}

export function chapterPathLabel(chapter: DocsChapter): string {
  return `/${chapter.slug.join("/")}`;
}
