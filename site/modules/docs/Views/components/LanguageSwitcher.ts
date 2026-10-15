"use client";

import { Box, Button, Component, Text, type PseudoStateBuilder } from "fiboui";
import { useEffect, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  localeLabels,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";

const localeShort: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
  es: "ES",
  zh: "中文",
};

function swapLocaleInPath(pathname: string, next: Locale): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && locales.includes(parts[1] as Locale)) {
    parts[1] = next;
    return parts.join("/") || `/${next}`;
  }
  return `/${next}${pathname === "/" ? "" : pathname}`;
}

export const LanguageSwitcher = Component()(() => {
  const { locale, t } = useLocale();
  const router = useRouter();
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const rootId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent | TouchEvent) => {
      const el = document.getElementById(rootId);
      if (!el) return;
      if (event.target instanceof Node && !el.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, rootId]);

  const pick = (code: Locale) => {
    setOpen(false);
    if (code === locale) return;
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
    router.push(swapLocaleInPath(pathname, code));
  };

  return Box()
    .props({
      id: rootId,
      role: "group",
      "aria-label": t.lang.label,
    })
    .style({
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
    })
    .children([
      Button()
        .key("trigger")
        .variant("raw")
        .props({
          "aria-haspopup": "listbox",
          "aria-expanded": open,
          "aria-label": t.lang.label,
        })
        .style({
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          padding: "5px 10px",
          borderRadius: 999,
          border: "1px solid var(--border-mid)",
          background: open ? "rgba(255,255,255,0.06)" : "transparent",
          color: "var(--ink-2)",
          cursor: "pointer",
          boxShadow: "none",
          height: "auto",
          minHeight: 0,
        })
        .hover((h: PseudoStateBuilder) => {
          h.color("var(--ink)").borderColor("var(--border-strong)");
        })
        .transition(["color", "background", "border-color"], 150, "ease-out")
        .onPress(() => setOpen((v) => !v))
        .children([
          Text(localeShort[locale])
            .key("code")
            .variant("caption")
            .style({ color: "inherit", fontWeight: 600, letterSpacing: "0.06em" })
            .build(),
          Text(open ? "▴" : "▾")
            .key("chev")
            .variant("caption")
            .style({
              color: "var(--ink-4)",
              fontSize: 9,
              lineHeight: 1,
              transform: "translateY(-0.5px)",
            })
            .build(),
        ])
        .build(),

      ...(open
        ? [
            Box()
              .key("menu")
              .props({ role: "listbox", "aria-label": t.lang.label })
              .style({
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                minWidth: 148,
                padding: 4,
                borderRadius: 10,
                border: "1px solid var(--border-mid)",
                background: "var(--bg-elevated, #121216)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                zIndex: 80,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              })
              .animate("fadeIn")
              .ease("easeOut")
              .children(
                locales.map((code) => {
                  const active = code === locale;
                  return Button()
                    .key(code)
                    .variant("raw")
                    .props({
                      role: "option",
                      "aria-selected": active,
                    })
                    .style({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      width: "100%",
                      fontSize: 12,
                      fontWeight: active ? 600 : 500,
                      padding: "8px 10px",
                      borderRadius: 7,
                      border: "none",
                      background: active ? "rgba(255,255,255,0.07)" : "transparent",
                      color: active ? "var(--ink)" : "var(--ink-3)",
                      cursor: "pointer",
                      boxShadow: "none",
                      height: "auto",
                      minHeight: 0,
                      textAlign: "left",
                    })
                    .hover((h: PseudoStateBuilder) => {
                      if (!active) h.bg("rgba(255,255,255,0.04)").color("var(--ink)");
                    })
                    .transition(["background", "color"], 120, "ease-out")
                    .onPress(() => pick(code))
                    .children([
                      Text(localeLabels[code])
                        .key("label")
                        .variant("caption")
                        .style({ color: "inherit" })
                        .build(),
                      Text(localeShort[code])
                        .key("short")
                        .variant("caption")
                        .style({
                          color: "var(--ink-4)",
                          fontSize: 10,
                          letterSpacing: "0.04em",
                        })
                        .build(),
                    ])
                    .build();
                }),
              )
              .build(),
          ]
        : []),
    ])
    .build();
});

/** Compact label+switcher for mobile drawers */
export function LanguageSwitcherLabel() {
  const { t } = useLocale();
  return Text(t.lang.label)
    .variant("caption")
    .style({
      fontSize: 11,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--ink-4)",
      marginBottom: 8,
      display: "block",
    })
    .build();
}
