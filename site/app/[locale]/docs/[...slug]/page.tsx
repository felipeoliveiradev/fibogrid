import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listDocs, readDoc } from "@/lib/docs";
import {
  isLocale,
  localizedPath,
  locales,
  type Locale,
} from "@/lib/i18n";
import { displayChapterTitle } from "@/modules/docs/ViewModels";
import { DocsArticlePage } from "@/modules/docs/Views";
import { DocsMarkdown } from "@/modules/docs/Views/components/markdown";

type PageProps = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    listDocs(locale).map((doc) => ({
      locale,
      slug: doc.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return { title: "Not found" };
  const doc = readDoc(slug, raw as Locale);
  if (!doc) return { title: "Not found" };
  const title = displayChapterTitle(doc.title);
  return {
    title,
    description: `FiboGrid documentation — ${title}`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const doc = readDoc(slug, locale);
  if (!doc) notFound();
  const siblings = listDocs(locale);
  const currentHref = localizedPath(locale, `/docs/${slug.join("/")}`);

  return (
    <DocsArticlePage
      chapters={siblings}
      currentHref={currentHref}
      slug={slug}
      title={doc.title}
      body={<DocsMarkdown content={doc.content} />}
    />
  );
}
