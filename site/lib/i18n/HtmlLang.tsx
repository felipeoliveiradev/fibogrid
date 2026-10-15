"use client";

import { useEffect } from "react";

/** Syncs `<html lang>` — root layout owns the tag, locale lives under `[locale]`. */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
