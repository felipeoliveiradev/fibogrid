import { notFound } from "next/navigation";
import {
  getDictionary,
  isLocale,
  localeHtmlLang,
  locales,
  type Locale,
} from "@/lib/i18n";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { HtmlLang } from "@/lib/i18n/HtmlLang";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dictionary = getDictionary(locale);

  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <HtmlLang lang={localeHtmlLang[locale]} />
      {children}
    </LocaleProvider>
  );
}
