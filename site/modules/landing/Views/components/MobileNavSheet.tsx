"use client";

import {
  Box,
  Button,
  Column,
  Component,
  Presence,
  PseudoStateBuilder,
  Row,
  Text,
} from "fiboui";
import type { MobileNavLink } from "../../Models";
import {
  copiedInstall,
  landingVm,
  mobileNavOpen,
} from "../../ViewModels/LandingViewModel";

export type { MobileNavLink };

function SheetLink(props: MobileNavLink) {
  return Button(props.label)
    .key(props.keyId)
    .variant("raw")
    .className("nv-sheet-link")
    .style({
      fontWeight: 400,
      background: "transparent",
      border: "none",
      cursor: "pointer",
      boxShadow: "none",
      width: "100%",
      justifyContent: "flex-start",
      textAlign: "left",
    })
    .press((p: PseudoStateBuilder) => {
      p.scale(0.98);
    })
    .onPress(props.onPress)
    .build();
}

function SheetChip(props: {
  keyId: string;
  label: string;
  className: string;
  onPress: () => void;
}) {
  return Button(props.label)
    .key(props.keyId)
    .variant("raw")
    .className(props.className)
    .style({
      fontWeight: 400,
      cursor: "pointer",
      boxShadow: "none",
      width: "100%",
    })
    .onPress(props.onPress)
    .build();
}

type MobileNavSheetProps = {
  links: MobileNavLink[];
  showActions?: boolean;
};

const MobileNavSheetComponent = (props: MobileNavSheetProps) => {
  const { links, showActions = true } = props;

  return Presence(mobileNavOpen)
    .enter("fadeIn")
    .exit("fadeOut")
    .duration(280)
    .children([
      Box()
        .key("sheet-root")
        .className("nv-sheet-root")
        .props({
          role: "dialog",
          "aria-modal": true,
          "aria-label": "Navigation menu",
        })
        .children([
          Box()
            .key("scrim")
            .className("nv-sheet-scrim")
            .props({ "aria-hidden": true })
            .onClick(() => landingVm.closeMobileNav()),

          Box()
            .key("panel")
            .className("nv-sheet-panel")
            .animate("slideUp", { duration: 340 })
            .ease("spring")
            .props({ role: "document" })
            .children([
              Box()
                .key("handle")
                .className("nv-sheet-handle")
                .props({ "aria-hidden": true }),

              Row()
                .key("head")
                .className("nv-sheet-head")
                .crossAxisAlignment("center")
                .mainAxisAlignment("spaceBetween")
                .children([
                  Text("Menu")
                    .key("title")
                    .variant("h3")
                    .className("nv-sheet-title"),
                  Button("Close")
                    .key("close")
                    .variant("raw")
                    .className("nv-sheet-close")
                    .style({
                      fontWeight: 400,
                      cursor: "pointer",
                      boxShadow: "none",
                      background: "transparent",
                      border: "none",
                    })
                    .onPress(() => landingVm.closeMobileNav()),
                ]),

              Column()
                .key("links")
                .className("nv-sheet-links")
                .crossAxisAlignment("stretch")
                .stagger(45)
                .children(
                  links.map((link) =>
                    Box()
                      .key(link.keyId)
                      .animate("fadeIn", { duration: 280 })
                      .ease("easeOut")
                      .children([SheetLink(link)]),
                  ),
                ),

              showActions
                ? Box()
                    .key("actions")
                    .className("nv-sheet-actions")
                    .bindSignal(copiedInstall)
                    .children(() => [
                      SheetChip({
                        keyId: "m-search",
                        label: "Search Docs",
                        className: "nv-pill-btn nv-sheet-chip",
                        onPress: () => {
                          landingVm.openLibrary();
                          landingVm.closeMobileNav();
                        },
                      }),
                      SheetChip({
                        keyId: "m-install",
                        label: copiedInstall.value
                          ? "copied ✓"
                          : "npm i fibogrid",
                        className: `nv-install-btn nv-sheet-chip${copiedInstall.value ? " is-copied" : ""}`,
                        onPress: () => {
                          landingVm.copyInstall();
                          landingVm.closeMobileNav();
                        },
                      }),
                    ])
                : Box().key("actions-empty"),
            ]),
        ]),
    ])
    .build();
};

export const MobileNavSheet = Component()(MobileNavSheetComponent);
