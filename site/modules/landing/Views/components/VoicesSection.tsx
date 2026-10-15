"use client";

import {
  Box,
  Button,
  Canvas,
  Column,
  Component,
  Container,
  Grid,
  Path,
  PseudoStateBuilder,
  Row,
  Text,
} from "fiboui";
import { useRouter } from "next/navigation";
import { split2Responsive } from "@/lib/fibo-fluent";
import { localizedPath } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { type VoiceCard } from "../../Models";
import { landingVm } from "../../ViewModels/LandingViewModel";
import { NOIR, NOIR_TEXT, sectionColumn } from "../theme";

const VoicesSectionComponent = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();
  const voices: VoiceCard[] = t.landing.voices.map((c) => ({
    quote: c.quote,
    author: c.author,
    badge: c.badge,
    href: c.href,
  }));

  const open = (href: string) => router.push(localizedPath(locale, href));

  const voiceCard = (c: VoiceCard, index: number) =>
    Box()
      .key(c.badge)
      .onScroll("fadeUp")
      .duration(620)
      .delay(index * 100)
      .ease("easeOut")
      .children([
        Box()
          .key("card")
          .style(NOIR.voiceCard)
          .props({
            role: "link",
            tabIndex: 0,
            onKeyDown: (e: { key: string }) => {
              if (e.key === "Enter") open(c.href);
            },
          })
          .hover((h: PseudoStateBuilder) => {
            h.bg("var(--card-hover)")
              .borderColor("var(--border-mid)")
              .translateX(4);
          })
          .onClick(() => open(c.href))
          .children([
            Column()
              .key("body")
              .style(NOIR.voiceBody)
              .crossAxisAlignment("start")
              .children([
                Text(c.quote)
                  .key("quote")
                  .variant("body")
                  .style(NOIR_TEXT.quote),
                Text(c.author)
                  .key("author")
                  .variant("caption")
                  .style(NOIR_TEXT.author),
              ]),
            Container()
              .key("avatar")
              .style(NOIR.voiceAvatar)
              .props({ "aria-hidden": "true" })
              .children([c.badge]),
          ]),
      ]);

  return sectionColumn({
    id: "ecosystem",
    labelledBy: "voices-title",
    style: NOIR.voicesSection,
  })
    .children([
      Canvas()
        .key("curve")
        .style(NOIR.voicesCurve)
        .size(1440, 520)
        .viewBox("0 0 1440 520")
        .props({ "aria-hidden": "true" })
        .children([
          Path()
            .d("M-80 430 C 320 460, 560 390, 760 250 C 960 110, 1180 140, 1520 310")
            .fill("none")
            .stroke("rgba(255,255,255,0.12)")
            .strokeWidth(2.5)
            .build(),
        ]),

      Container()
        .key("wrap")
        .style({ ...NOIR.wrap, position: "relative", zIndex: 1 })
        .children([
          Grid()
            .key("voices-grid")
            .style({
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "clamp(36px, 6vw, 84px)",
              alignItems: "start",
              width: "100%",
            })
            .responsive(split2Responsive)
            .children([
              Column()
                .key("voices-left")
                .crossAxisAlignment("stretch")
                .children([
                  Text(t.landing.voicesTitle)
                    .key("title")
                    .variant("h2")
                    .id("voices-title")
                    .style({ ...NOIR_TEXT.h2, whiteSpace: "pre-line" })
                    .onScroll("slideUp")
                    .duration(560)
                    .ease("easeOut"),

                  Container()
                    .key("divider")
                    .style(NOIR.voicesDivider)
                    .props({ "aria-hidden": "true" }),

                  Text(t.landing.voicesCopy)
                    .key("copy")
                    .variant("body")
                    .style({ ...NOIR_TEXT.copy, maxWidth: "46ch" }),

                  Row()
                    .key("actions")
                    .style({ marginTop: 28 })
                    .spacing(14)
                    .crossAxisAlignment("center")
                    .children([
                      Button(t.landing.readDocs)
                        .key("docs")
                        .clean()
                        .style(NOIR.btnRect)
                        .hover((h) => {
                          h.bg("var(--ink)").color("var(--bg)").borderColor("var(--ink)");
                        })
                        .transition(
                          ["background", "color", "border-color"],
                          180,
                          "ease-out",
                        )
                        .press((p: PseudoStateBuilder) => {
                          p.scale(0.97);
                        })
                        .onPress(() => open("/docs")),
                      Button()
                        .key("index")
                        .clean()
                        .style(NOIR.btnPlay)
                        .hover((h) => {
                          h.color("var(--ink)");
                        })
                        .transition("color", 180, "ease-out")
                        .press((p: PseudoStateBuilder) => {
                          p.scale(0.97);
                        })
                        .onPress(() => landingVm.openLibrary())
                        .children([
                          Container()
                            .key("icon")
                            .style(NOIR.playIcon)
                            .props({ "aria-hidden": "true" })
                            .children(["⌘"]),
                          Text(t.landing.openIndex)
                            .key("label")
                            .variant("caption")
                            .style(NOIR_TEXT.inherit),
                        ]),
                    ]),
                ]),

              Column()
                .key("voices-stack")
                .style(NOIR.voicesStack)
                .crossAxisAlignment("stretch")
                .children(voices.map((c, i) => voiceCard(c, i))),
            ]),
        ]),
    ])
    .build();
};

export const VoicesSection = Component()(VoicesSectionComponent);
