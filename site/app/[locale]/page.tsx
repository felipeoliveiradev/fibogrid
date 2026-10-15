import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { LandingPage } from "@/modules/landing/Views";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = getDictionary(raw as Locale);
  return {
    title: { absolute: t.meta.titleDefault },
    description: t.meta.description,
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "FiboGrid",
    version: "1.0.31",
    programmingLanguage: "TypeScript",
    runtimePlatform: "React 18 / React 19",
    codeRepository: "https://github.com/felipeoliveiradev/fibogrid",
    license: "https://opensource.org/licenses/MIT",
    description:
      "Virtualised React 18/19 data grid engineered on the Golden Ratio. Smooth scroll across 100,000+ rows, O(1) indexed state, and a typed imperative GridApi.",
    inLanguage: raw,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
