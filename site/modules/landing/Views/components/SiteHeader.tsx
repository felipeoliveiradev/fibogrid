"use client";

import type { CSSProperties } from "react";
import { Box, Button, Component, goHash, open, Text } from "fiboui";
import { useRouter } from "next/navigation";
import {
  navChromeResponsive,
  navInnerResponsive,
  showBelowDesktop,
  showDesktopOnly,
} from "@/lib/fibo-fluent";
import { localizedPath } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { LanguageSwitcher, LanguageSwitcherLabel } from "@/modules/docs/Views/components/LanguageSwitcher";
import {
  copiedInstall,
  landingVm,
  mobileNavOpen,
} from "../../ViewModels/LandingViewModel";
import { NOIR } from "../theme";
import { FiboMark } from "./FiboLogo";

function NavLink(props: {
  label: string;
  onPress: () => void;
  keyId?: string;
  drawer?: boolean;
}) {
  return Button(props.label)
    .key(props.keyId ?? props.label)
    .variant("raw")
    .style(
      props.drawer
        ? {
            ...NOIR.navLink,
            display: "flex",
            width: "100%",
            padding: "12px 4px",
            fontSize: 14,
            lineHeight: 1.3,
            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
          }
        : NOIR.navLink,
    )
    .transition("color", 180, "ease-out")
    .hover((h) => {
      h.color("var(--ink)");
    })
    .onPress(props.onPress)
    .build();
}

function ActionChip(props: {
  label: string;
  onPress: () => void;
  style: CSSProperties;
  keyId?: string;
  hoverBorder?: string;
  hoverBg?: string;
  hoverColor?: string;
  fullWidth?: boolean;
}) {
  const b = Button(props.label)
    .key(props.keyId ?? props.label)
    .variant("raw")
    .style({
      ...props.style,
      ...(props.fullWidth
        ? { width: "100%", marginTop: 8, justifyContent: "flex-start", paddingInline: 14 }
        : {}),
    })
    .transition(["border-color", "background", "color"], 180, "ease-out")
    .onPress(props.onPress);

  if (props.hoverBorder || props.hoverBg || props.hoverColor) {
    b.hover((h) => {
      if (props.hoverBorder) h.borderColor(props.hoverBorder);
      if (props.hoverBg) h.bg(props.hoverBg);
      if (props.hoverColor) h.color(props.hoverColor);
    });
  }

  return b.build();
}

const SiteHeaderComponent = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();

  const jump = (hash: string) => {
    goHash(hash);
    landingVm.closeMobileNav();
  };

  const goDocs = () => {
    router.push(localizedPath(locale, "/docs"));
    landingVm.closeMobileNav();
  };

  return Box()
    .style(NOIR.nav)
    .props({ role: "banner" })
    .sticky(0)
    .responsive(navChromeResponsive)
    .animate("fadeIn", { duration: 420 })
    .ease("easeOut")
    .children([
      Box()
        .key("inner")
        .style(NOIR.navInner)
        .responsive(navInnerResponsive)
        .children([
          Button()
            .key("brand")
            .variant("raw")
            .style(NOIR.brand)
            .responsive({
              mobile: { fontSize: 12.5, letterSpacing: "0.08em", gap: 8 },
            })
            .onPress(() => router.push(localizedPath(locale)))
            .children([
              FiboMark({ key: "mark", size: 20 }),
              Text("FIBOGRID").key("label").build(),
            ])
            .build(),

          Box()
            .key("links")
            .props({ role: "navigation", "aria-label": "Primary" })
            .style({ ...NOIR.navLinks, ...showDesktopOnly.style })
            .responsive(showDesktopOnly.responsive)
            .children([
              NavLink({
                label: t.nav.architecture,
                onPress: () => jump("architecture"),
              }),
              NavLink({
                label: t.nav.workbench,
                onPress: () => jump("workbench"),
              }),
              NavLink({
                label: t.nav.registry,
                onPress: () => jump("ecosystem"),
              }),
              NavLink({
                label: t.nav.documentation,
                onPress: goDocs,
              }),
              NavLink({
                label: t.nav.github,
                onPress: () => {
                  open("https://github.com/felipeoliveiradev/fibogrid");
                },
              }),
            ])
            .build(),

          Box()
            .key("actions")
            .style({ ...NOIR.navActions, ...showDesktopOnly.style })
            .responsive(showDesktopOnly.responsive)
            .children([
              LanguageSwitcher(),
              ActionChip({
                label: t.nav.searchDocs,
                style: NOIR.pillBtn,
                onPress: () => landingVm.openLibrary(),
                hoverBorder: "var(--border-strong)",
                hoverBg: "rgba(255, 255, 255, 0.05)",
                hoverColor: "var(--ink)",
              }),
              Box()
                .key("copy")
                .style({ display: "inline-flex", alignItems: "center" })
                .bindSignal(copiedInstall)
                .children(() => [
                  ActionChip({
                    keyId: "install",
                    label: copiedInstall.value ? t.nav.copied : t.nav.install,
                    style: {
                      ...NOIR.installBtn,
                      ...(copiedInstall.value ? NOIR.installBtnCopied : {}),
                    },
                    onPress: () => landingVm.copyInstall(),
                    hoverBorder: "rgba(255, 255, 255, 0.28)",
                    hoverBg: "#18181e",
                  }),
                ])
                .build(),
            ])
            .build(),

          Box()
            .key("mobile")
            .style({ ...showBelowDesktop.style, justifySelf: "end" })
            .responsive(showBelowDesktop.responsive)
            .bindSignal(mobileNavOpen)
            .children(() => [
              ActionChip({
                keyId: "menu",
                label: mobileNavOpen.value ? t.nav.close : t.nav.menu,
                style: NOIR.mobileBtn,
                onPress: () => landingVm.toggleMobileNav(),
              }),
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
                  .props({ role: "navigation", "aria-label": "Mobile" })
                  .animate("fadeIn")
                  .ease("easeOut")
                  .children([
                    NavLink({
                      keyId: "m-arch",
                      label: t.nav.architecture,
                      drawer: true,
                      onPress: () => jump("architecture"),
                    }),
                    NavLink({
                      keyId: "m-wb",
                      label: t.nav.workbench,
                      drawer: true,
                      onPress: () => jump("workbench"),
                    }),
                    NavLink({
                      keyId: "m-bus",
                      label: t.nav.registry,
                      drawer: true,
                      onPress: () => jump("ecosystem"),
                    }),
                    NavLink({
                      keyId: "m-docs",
                      label: t.nav.documentation,
                      drawer: true,
                      onPress: goDocs,
                    }),
                    NavLink({
                      keyId: "m-gh",
                      label: t.nav.github,
                      drawer: true,
                      onPress: () => {
                        open("https://github.com/felipeoliveiradev/fibogrid");
                        landingVm.closeMobileNav();
                      },
                    }),
                    Box()
                      .key("m-lang")
                      .style({ paddingTop: 12, paddingInline: 4 })
                      .children([LanguageSwitcherLabel(), LanguageSwitcher()])
                      .build(),
                    Box()
                      .key("m-actions")
                      .style(NOIR.drawerActions)
                      .children([
                        ActionChip({
                          keyId: "m-search",
                          label: t.nav.searchDocs,
                          style: NOIR.pillBtn,
                          fullWidth: true,
                          onPress: () => {
                            landingVm.openLibrary();
                            landingVm.closeMobileNav();
                          },
                          hoverBorder: "var(--border-strong)",
                          hoverBg: "rgba(255, 255, 255, 0.05)",
                          hoverColor: "var(--ink)",
                        }),
                        Box()
                          .key("m-copy")
                          .bindSignal(copiedInstall)
                          .children(() => [
                            ActionChip({
                              keyId: "m-install",
                              label: copiedInstall.value
                                ? t.nav.copied
                                : t.nav.install,
                              style: {
                                ...NOIR.installBtn,
                                ...(copiedInstall.value
                                  ? NOIR.installBtnCopied
                                  : {}),
                              },
                              fullWidth: true,
                              onPress: () => {
                                landingVm.copyInstall();
                                landingVm.closeMobileNav();
                              },
                              hoverBorder: "rgba(255, 255, 255, 0.28)",
                              hoverBg: "#18181e",
                            }),
                          ])
                          .build(),
                      ])
                      .build(),
                  ])
                  .build(),
              ]
            : [],
        )
        .build(),
    ])
    .build();
};

export const SiteHeader = Component()(SiteHeaderComponent);
