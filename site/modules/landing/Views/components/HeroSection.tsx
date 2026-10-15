"use client";

import {
  Badge,
  Box,
  Button,
  Column,
  Component,
  Container,
  Grid,
  PseudoStateBuilder,
  Row,
  Text,
} from "fiboui";
import React from "react";
import { HeroOrderbookSpecimen } from "@/components/RealFiboGridShowcase";
import { heroGridResponsive } from "@/lib/fibo-fluent";
import { DUR, STAGGER } from "@/lib/fibo-motion";
import { useT } from "@/lib/i18n/locale-context";
import { SPEC_PILLS } from "../../Models";
import { copiedInstall, landingVm } from "../../ViewModels/LandingViewModel";
import { NOIR, NOIR_TEXT, PILL_STYLE, goHash, sectionColumn } from "../theme";

const HeroSectionComponent = () => {
  const t = useT();

  return sectionColumn({
    labelledBy: "hero-title",
    noReveal: true,
    style: NOIR.heroSection,
  })
    .children([
      Box().key("glow").style(NOIR.heroGlow).props({ "aria-hidden": "true" }),

      Container()
        .key("wrap")
        .style(NOIR.wrap)
        .children([
          Grid()
            .key("grid")
            .style({
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "clamp(36px, 5vw, 72px)",
              alignItems: "center",
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
            })
            .responsive(heroGridResponsive)
            .children([
              Box()
                .key("specimen-motion")
                .style({
                  minWidth: 0,
                  maxWidth: "100%",
                  width: "100%",
                  overflow: "hidden",
                })
                .animate("fadeIn", { duration: DUR.hero, delay: 80 })
                .ease("easeOut")
                .children([
                  React.createElement(HeroOrderbookSpecimen, {
                    key: "hero-specimen",
                  }),
                ]),

              Column()
                .key("hero-copy-col")
                .style({ ...NOIR.heroCopy, order: -1 })
                .responsive({
                  desktop: { order: 0 },
                })
                .crossAxisAlignment("start")
                .stagger(STAGGER.pills)
                .children([
                  Text(t.landing.heroTitle)
                    .key("title")
                    .variant("h1")
                    .id("hero-title")
                    .style({ ...NOIR_TEXT.h1, whiteSpace: "pre-line" })
                    .animate("slideUp", { duration: DUR.hero })
                    .ease("spring"),

                  Row()
                    .key("pills")
                    .style(NOIR.pillRow)
                    .props({
                      role: "group",
                      "aria-label": "Core specifications",
                    })
                    .stagger(STAGGER.pills)
                    .children(
                      SPEC_PILLS.map((label) =>
                        Badge()
                          .key(label)
                          .variant("outline")
                          .shape("pill")
                          .text(label)
                          .style(PILL_STYLE)
                          .animate("fadeIn", { duration: DUR.card })
                          .ease("easeOut"),
                      ),
                    ),

                  Box()
                    .key("copy")
                    .style({ ...NOIR_TEXT.copy, maxWidth: "42ch" })
                    .animate("fadeIn", { duration: DUR.section, delay: 120 })
                    .ease("easeOut")
                    .children([
                      Text(t.landing.heroLeadBefore)
                        .key("a")
                        .variant("caption")
                        .style(NOIR_TEXT.inherit),
                      Text("gridApi.manager()")
                        .key("code")
                        .variant("caption")
                        .mono()
                        .style({ ...NOIR_TEXT.inherit, color: "#F4F4F6" }),
                      Text(t.landing.heroLeadAfter)
                        .key("b")
                        .variant("caption")
                        .style(NOIR_TEXT.inherit),
                    ]),

                  Row()
                    .key("actions")
                    .style(NOIR.actionsRow)
                    .crossAxisAlignment("center")
                    .animate("slideUp", { duration: DUR.section, delay: 180 })
                    .ease("easeOut")
                    .children([
                      Box()
                        .key("copy-cta")
                        .bindSignal(copiedInstall)
                        .children(() => [
                          Button(
                            copiedInstall.value
                              ? t.landing.copiedInstall
                              : t.landing.learnMore,
                          )
                            .key("cta")
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
                            .onPress(() => landingVm.copyInstall()),
                        ]),

                      Button()
                        .key("play")
                        .clean()
                        .style(NOIR.btnPlay)
                        .hover((h) => {
                          h.color("var(--ink)");
                        })
                        .transition("color", 180, "ease-out")
                        .press((p: PseudoStateBuilder) => {
                          p.scale(0.97);
                        })
                        .onPress(() => goHash("workbench"))
                        .children([
                          Container()
                            .key("icon")
                            .style(NOIR.playIcon)
                            .props({ "aria-hidden": "true" })
                            .children(["▶"]),
                          Text(t.landing.interactiveDemo)
                            .key("label")
                            .variant("caption")
                            .style(NOIR_TEXT.inherit),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ])
    .build();
};

export const HeroSection = Component()(HeroSectionComponent);
