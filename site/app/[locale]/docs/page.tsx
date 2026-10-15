import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listDocs } from "@/lib/docs";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { DocsIndexPage } from "@/modules/docs/Views";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return { title: "Documentation" };
  const t = getDictionary(raw as Locale);
  return {
    title: t.docs.documentation,
    description: t.docs.indexLead,
  };
}

export default async function DocsIndexRoute({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  return <DocsIndexPage docs={listDocs(locale)} />;
}
