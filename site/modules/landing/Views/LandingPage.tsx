"use client";

import { Box, Column, Component } from "fiboui";
import React from "react";
import {
  LinkedRegistrySpecimen,
  MainWorkbenchSpecimen,
  RealFiboGridProvider,
} from "@/components/RealFiboGridShowcase";
import { ArchitectureSection } from "./components/ArchitectureSection";
import { CmdPalette } from "./components/CmdPalette";
import { FaqSection } from "./components/FaqSection";
import { HeroSection } from "./components/HeroSection";
import { SiteFooterBar } from "./components/SiteFooterBar";
import { SiteHeader } from "./components/SiteHeader";
import { VoicesSection } from "./components/VoicesSection";

const LandingPageComponent = () =>
  React.createElement(
    RealFiboGridProvider,
    null,
    Column()
      .theme("noir")
      .style({ minWidth: 0, maxWidth: "100%", overflowX: "clip" })
      .crossAxisAlignment("stretch")
      .smoothScroll()
      .children([
        Box()
          .key("scroll-progress")
          .props({ "aria-hidden": "true" })
          .scrollProgress()
          .style({
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            zIndex: 120,
            background:
              "linear-gradient(90deg, rgba(244,244,246,0.15), rgba(244,244,246,0.85))",
            pointerEvents: "none",
            willChange: "transform",
          }),

        SiteHeader({ key: "header" }),
        Column()
          .key("main")
          .style({ minWidth: 0, maxWidth: "100%", overflowX: "clip" })
          .crossAxisAlignment("stretch")
          .props({ role: "main" })
          .children([
            HeroSection({ key: "hero" }),
            ArchitectureSection({ key: "architecture" }),
            Box()
              .key("workbench-wrap")
              .style({ minWidth: 0, maxWidth: "100%", width: "100%", overflowX: "clip" })
              .onScroll("fadeUp")
              .duration(600)
              .ease("easeOut")
              .children([
                React.createElement(MainWorkbenchSpecimen, {
                  key: "workbench",
                }),
              ]),
            VoicesSection({ key: "voices" }),
            Box()
              .key("registry-wrap")
              .style({ minWidth: 0, maxWidth: "100%", width: "100%", overflowX: "clip" })
              .onScroll("scaleIn")
              .duration(620)
              .ease("easeOut")
              .children([
                React.createElement(LinkedRegistrySpecimen, {
                  key: "registry",
                }),
              ]),
            FaqSection({ key: "faq" }),
          ]),
        SiteFooterBar({ key: "footer" }),
        CmdPalette({ key: "cmd" }),
      ])
      .build(),
  );

export const LandingPage = Component()(LandingPageComponent);
