"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./dictionaries/en";
import type { Locale } from "./config";
import { defaultLocale } from "./config";
import { en } from "./dictionaries/en";

type LocaleContextValue = {
  locale: Locale;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  t: en,
});

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  return useContext(LocaleContext).t;
}
