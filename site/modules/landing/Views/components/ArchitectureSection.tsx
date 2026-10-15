"use client";

import {
  Box,
  Button,
  Column,
  Component,
  Container,
  PseudoStateBuilder,
  Row,
  ScrollView,
  Text,
} from "fiboui";
import { useRouter } from "next/navigation";
import { localizedPath } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { ARCH_SLIDE_GAP, type ArchitectureIconKind } from "../../Models";
import {
  architectureScroll,
  landingVm,
} from "../../ViewModels/LandingViewModel";
import { NOIR, NOIR_TEXT, sectionColumn } from "../theme";
import { architectureIcon } from "./architecture/icons";

type ArchCard = {
  title: string;
  desc: string;
  href: string;
  icon: string;
};

const ArchitectureSectionComponent = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();
  const cards: ArchCard[] = t.landing.architectureCards.map((c) => ({
    title: c.title,
    desc: c.desc,
    href: c.href,
    icon: c.icon,
  }));

  const slide = (c: ArchCard, index: number) =>
    Box()
      .key(c.title)
      .scrollSnapAlign("start")
      .style({
        flex: "0 0 min(100%, 320px)",
        minWidth: 0,
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
      })
      .responsive({
        tablet: { flex: `0 0 calc((100% - ${ARCH_SLIDE_GAP}px) / 2)` },
        desktop: { flex: `0 0 calc((100% - ${ARCH_SLIDE_GAP * 2}px) / 3)` },
      })
      .children([
        Box()
          .key("reveal")
          .style({ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, width: "100%" })
          .onScroll("fadeUp")
          .duration(480)
          .delay(Math.min(index, 2) * 90)
          .ease("easeOut")
          .children([
            Column()
              .key("card")
              .style({ ...NOIR.serviceCard, flex: 1, width: "100%" })
              .fillWidth()
              .props({ role: "group", "aria-label": c.title })
              .hover((h: PseudoStateBuilder) => {
                h.bg("var(--card-hover)").borderColor("var(--border-mid)");
              })
              .press((p: PseudoStateBuilder) => {
                p.scale(0.99);
              })
              .transition(["border-color", "background", "transform"], 180, "ease-out")
              .children([
                Container()
                  .key("icon")
                  .style(NOIR.serviceIcon)
                  .props({ "aria-hidden": "true" })
                  .children([
                    architectureIcon(c.icon as ArchitectureIconKind),
                  ]),
                Text(c.title)
                  .key("title")
                  .variant("h3")
                  .style({ ...NOIR_TEXT.cardTitle, marginBottom: 14 }),
                Text(c.desc)
                  .key("desc")
                  .variant("body")
                  .style({
                    ...NOIR_TEXT.cardDesc,
                    marginBottom: 32,
                    flex: 1,
                  }),
                Button(t.landing.learnMoreLink)
                  .key("link")
                  .clean()
                  .style(NOIR.serviceLink)
                  .hover((h: PseudoStateBuilder) => {
                    h.color("var(--ink)");
                  })
                  .transition("color", 180, "ease-out")
                  .onPress(() => router.push(localizedPath(locale, c.href))),
              ]),
          ]),
      ]);

  return sectionColumn({
    id: "architecture",
    labelledBy: "arch-title",
    style: NOIR.sectionPad,
  })
    .children([
      Container()
        .key("wrap")
        .style(NOIR.wrap)
        .children([
          Row()
            .key("bar")
            .style(NOIR.sectionBar)
            .crossAxisAlignment("center")
            .mainAxisAlignment("spaceBetween")
            .children([
              Text(t.landing.archTitle)
                .key("title")
                .variant("h2")
                .id("arch-title")
                .style(NOIR_TEXT.h2),

              Row()
                .key("nav")
                .style(NOIR.circleNav)
                .hug()
                .crossAxisAlignment("center")
                .props({ "aria-label": t.landing.archCarousel })
                .children([
                  Button("‹")
                    .key("prev")
                    .clean()
                    .style(NOIR.circleBtn)
                    .hover((h: PseudoStateBuilder) => {
                      h.bg("var(--card-hover)")
                        .borderColor("var(--border-strong)")
                        .color("var(--ink)");
                    })
                    .transition(
                      ["background", "border-color", "color"],
                      180,
                      "ease-out",
                    )
                    .props({ "aria-label": t.landing.archPrev })
                    .onPress(() => landingVm.scrollArchitecture(-1)),
                  Button("›")
                    .key("next")
                    .clean()
                    .style(NOIR.circleBtn)
                    .hover((h: PseudoStateBuilder) => {
                      h.bg("var(--card-hover)")
                        .borderColor("var(--border-strong)")
                        .color("var(--ink)");
                    })
                    .transition(
                      ["background", "border-color", "color"],
                      180,
                      "ease-out",
                    )
                    .props({ "aria-label": t.landing.archNext })
                    .onPress(() => landingVm.scrollArchitecture(1)),
                ]),
            ]),

          ScrollView()
            .key("carousel")
            .horizontal()
            .scrollbar("hidden")
            .scrollSnap("x")
            .controller(architectureScroll)
            .width("100%")
            .style({ gap: ARCH_SLIDE_GAP, alignItems: "stretch" })
            .props({
              role: "region",
              "aria-roledescription": "carousel",
              "aria-label": t.landing.archRegion,
            })
            .children(cards.map((c, i) => slide(c, i))),
        ]),
    ])
    .build();
};

export const ArchitectureSection = Component()(ArchitectureSectionComponent);
