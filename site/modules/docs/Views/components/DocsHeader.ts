"use client";

import { Box, Button, Component, open, Text } from "fiboui";
import { useRouter } from "next/navigation";
import {
  navChromeResponsive,
  navInnerDocsResponsive,
  showBelowDesktop,
  showDesktopOnly,
} from "@/lib/fibo-fluent";
import { localizedPath } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { landingVm, mobileNavOpen } from "@/modules/landing/ViewModels/LandingViewModel";
import { FiboMark } from "@/modules/landing/Views/components/FiboLogo";
import { NOIR } from "@/modules/landing/Views/theme";
import { LanguageSwitcher, LanguageSwitcherLabel } from "./LanguageSwitcher";

const rawLink = (label: string, onPress: () => void, keyId?: string, drawer?: boolean) =>
  Button(label)
    .key(keyId ?? label)
    .variant("raw")
    .style(
      drawer
        ? {
            ...NOIR.navLink,
            display: "flex",
            width: "100%",
            padding: "12px 4px",
            fontSize: 14,
            lineHeight: 1.3,
            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
          }
        : {
            ...NOIR.navLink,
            fontSize: 13,
            letterSpacing: "0.01em",
          },
    )
    .transition("color", 180, "ease-out")
    .hover((h) => {
      h.color("var(--ink)");
    })
    .onPress(onPress)
    .build();

export const DocsHeader = Component()(() => {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();

  const go = (path: string) => {
    router.push(localizedPath(locale, path));
    landingVm.closeMobileNav();
  };

  return Box()
    .props({ role: "banner" })
    .style({
      ...NOIR.nav,
      borderBottom: "1px solid var(--border-subtle)",
    })
    .className("dc-topbar")
    .sticky(0)
    .responsive(navChromeResponsive)
    .children([
      Box()
        .key("inner")
        .style({
          ...NOIR.navInner,
          gridTemplateColumns: "auto minmax(0, 1fr) auto",
          maxWidth: 1180,
          marginInline: "auto",
          width: "100%",
          paddingInline: "clamp(20px, 4vw, 40px)",
        })
        .responsive(navInnerDocsResponsive)
        .children([
          Box()
            .key("brand-wrap")
            .style({ display: "inline-flex", alignItems: "center", gap: 10 })
            .children([
              Button()
                .key("brand")
                .variant("raw")
                .style(NOIR.brand)
                .responsive({
                  mobile: { fontSize: 12.5, letterSpacing: "0.08em", gap: 8 },
                })
                .onPress(() => go("/"))
                .children([
                  FiboMark({ key: "mark", size: 18 }),
                  Text("FIBOGRID").key("label").build(),
                ])
                .build(),
              Text(t.nav.docsBadge)
                .key("badge")
                .variant("caption")
                .style({
                  ...showDesktopOnly.style,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "var(--ink-3)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: 999,
                  padding: "2px 8px",
                })
                .responsive(showDesktopOnly.responsive)
                .build(),
            ])
            .build(),

          Box()
            .key("links")
            .props({ role: "navigation", "aria-label": t.docs.documentation })
            .style({
              ...NOIR.navLinks,
              ...showDesktopOnly.style,
              justifyContent: "center",
              gap: 22,
            })
            .responsive(showDesktopOnly.responsive)
            .children([
              rawLink(t.nav.product, () => go("/")),
              rawLink(t.nav.documentation, () => go("/docs")),
              rawLink(
                t.nav.github,
                () => {
                  open("https://github.com/felipeoliveiradev/fibogrid");
                },
                "gh",
              ),
            ])
            .build(),

          Box()
            .key("actions")
            .style({
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              justifySelf: "end",
            })
            .children([
              Box()
                .key("lang")
                .style({ ...showDesktopOnly.style })
                .responsive(showDesktopOnly.responsive)
                .children([LanguageSwitcher()])
                .build(),
              Button()
                .key("search")
                .variant("raw")
                .style({
                  ...NOIR.pillBtn,
                  ...showDesktopOnly.style,
                  gap: 10,
                  paddingInline: 12,
                  color: "var(--ink-3)",
                })
                .responsive(showDesktopOnly.responsive)
                .hover((h) => {
                  h.borderColor("var(--border-strong)")
                    .bg("rgba(255, 255, 255, 0.04)")
                    .color("var(--ink)");
                })
                .transition(["border-color", "background", "color"], 180, "ease-out")
                .onPress(() => landingVm.openLibrary())
                .children([
                  Text(t.nav.search)
                    .key("l")
                    .variant("caption")
                    .style({ color: "inherit" })
                    .build(),
                  Text("⌘K")
                    .key("k")
                    .variant("caption")
                    .style({
                      fontSize: 10,
                      color: "var(--ink-4)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 4,
                      padding: "1px 5px",
                      fontFamily: "var(--font-mono-loaded), ui-monospace, monospace",
                    })
                    .build(),
                ])
                .build(),
              Box()
                .key("mobile")
                .style({ ...showBelowDesktop.style })
                .responsive(showBelowDesktop.responsive)
                .bindSignal(mobileNavOpen)
                .children(() => [
                  Button(mobileNavOpen.value ? t.nav.close : t.nav.menu)
                    .key("menu")
                    .variant("raw")
                    .style(NOIR.mobileBtn)
                    .onPress(() => landingVm.toggleMobileNav())
                    .build(),
                ])
                .build(),
            ])
            .build(),
        ])
        .build(),

      Box()
        .key("drawer-slot")
        .bindSignal(mobileNavOpen)
        .children(() =>
          mobileNavOpen.value
            ? [
                Box()
                  .key("drawer")
                  .style(NOIR.drawer)
                  .props({ role: "navigation", "aria-label": t.docs.documentation })
                  .animate("fadeIn")
                  .ease("easeOut")
                  .children([
                    rawLink(t.nav.product, () => go("/"), "m-home", true),
                    rawLink(t.nav.documentation, () => go("/docs"), "m-docs", true),
                    rawLink(
                      t.nav.searchDocs,
                      () => {
                        landingVm.openLibrary();
                        landingVm.closeMobileNav();
                      },
                      "m-search",
                      true,
                    ),
                    rawLink(
                      t.nav.github,
                      () => {
                        open("https://github.com/felipeoliveiradev/fibogrid");
                        landingVm.closeMobileNav();
                      },
                      "m-gh",
                      true,
                    ),
                    Box()
                      .key("m-lang")
                      .style({ paddingTop: 16, paddingInline: 4 })
                      .children([LanguageSwitcherLabel(), LanguageSwitcher()])
                      .build(),
                  ])
                  .build(),
              ]
            : [],
        )
        .build(),
    ])
    .build();
});
