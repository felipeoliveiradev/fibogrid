"use client";

import { Box, Button, Column, Component, Container, Row, Text } from "fiboui";
import type { FiboChild } from "fiboui";
import { useRouter } from "next/navigation";
import { footerGridResponsive } from "@/lib/fibo-fluent";
import { localizedPath } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { landingVm } from "../../ViewModels/LandingViewModel";
import { NOIR, NOIR_TEXT, goHash, linkButton, openExternal } from "../theme";
import { FiboMark } from "./FiboLogo";

function linkColumn(key: string, title: string, items: FiboChild[]) {
  return Column()
    .key(key)
    .crossAxisAlignment("start")
    .children([
      Text(title)
        .key("title")
        .variant("h3")
        .style(NOIR.footerColH),
      Column()
        .key("list")
        .style(NOIR.footerList)
        .crossAxisAlignment("start")
        .children(items),
    ]);
}

const SiteFooterBarComponent = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();

  const brandBlock = Column()
    .key("brand")
    .crossAxisAlignment("start")
    .children([
      Button()
        .key("brand-link")
        .variant("raw")
        .style({ ...NOIR.brand, marginBottom: 16 })
        .onPress(() => router.push(localizedPath(locale)))
        .children([
          FiboMark({ key: "mark", size: 20 }),
          Text("FIBOGRID").key("label").variant("caption"),
        ]),
      Text(t.landing.footerBlurb)
        .key("blurb")
        .variant("body")
        .style({ ...NOIR_TEXT.copy, maxWidth: "34ch", marginTop: 14 }),
      Button(t.landing.poweredBy)
        .key("powered")
        .variant("raw")
        .style({ ...NOIR.footerPowered, marginTop: 20 })
        .props({ "aria-label": t.landing.poweredBy })
        .onPress(() => openExternal("https://www.npmjs.com/package/fiboui")),
    ]);

  const specimens = linkColumn("specimens", t.landing.footerSpecimens, [
    linkButton(t.landing.footerHero, () => goHash("hero-specimen")).key("hero"),
    linkButton(t.landing.footerWorkbench, () => goHash("workbench")).key("workbench"),
    linkButton(t.landing.footerLinked, () => goHash("linked-grids")).key("linked"),
    linkButton(t.landing.footerFaq, () => goHash("faq")).key("faq"),
  ]);

  const docs = linkColumn("docs", t.landing.footerDocs, [
    linkButton(t.landing.footerCmdSearch, () => landingVm.openLibrary()).key("search"),
    linkButton(t.landing.footerOverview, () =>
      router.push(localizedPath(locale, "/docs/01-overview")),
    ).key("overview"),
    linkButton(t.landing.footerHooks, () =>
      router.push(localizedPath(locale, "/docs/03-hooks")),
    ).key("hooks"),
    linkButton(t.landing.footerApi, () =>
      router.push(localizedPath(locale, "/docs/05-api")),
    ).key("api"),
  ]);

  const distribution = linkColumn("distribution", t.landing.footerDistribution, [
    linkButton(t.landing.footerNpm, () =>
      openExternal("https://www.npmjs.com/package/fibogrid"),
    ).key("npm"),
    linkButton(t.landing.footerGithub, () =>
      openExternal("https://github.com/felipeoliveiradev/fibogrid"),
    ).key("github"),
    Text(t.landing.footerStack).key("stack").variant("caption"),
    Text(t.landing.footerLicense).key("license").variant("caption"),
  ]);

  const grid = Container()
    .key("grid")
    .style(NOIR.footerGrid)
    .responsive(footerGridResponsive)
    .children([brandBlock, specimens, docs, distribution]);

  const bottom = Row()
    .key("bottom")
    .style(NOIR.footerBottom)
    .children([
      Text(t.landing.rights)
        .key("copyright")
        .variant("caption"),
      Text(t.landing.footerEngineered)
        .key("engineered")
        .variant("caption"),
    ]);

  return Column()
    .style(NOIR.footer)
    .props({ role: "contentinfo" })
    .crossAxisAlignment("stretch")
    .onScroll("fadeUp")
    .duration(560)
    .ease("easeOut")
    .children([
      Column()
        .key("wrap")
        .style(NOIR.wrap)
        .crossAxisAlignment("stretch")
        .stagger(60)
        .children([grid, bottom]),
    ])
    .build();
};

export const SiteFooterBar = Component()(SiteFooterBarComponent);
