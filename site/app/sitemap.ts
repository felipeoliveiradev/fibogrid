import type { MetadataRoute } from "next";
import { listDocs } from "@/lib/docs";
import { locales, localizedPath, type Locale } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fibogrid.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${siteUrl}${localizedPath(locale as Locale)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: locale === "en" ? 1 : 0.9,
    });
    entries.push({
      url: `${siteUrl}${localizedPath(locale as Locale, "/docs")}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    });
    for (const doc of listDocs(locale as Locale)) {
      entries.push({
        url: `${siteUrl}${doc.href}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
