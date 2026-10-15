"use client";

import { Box, Button, Component, Container, Row, Text, TextField } from "fiboui";
import { useRouter } from "next/navigation";
import { localizedPath } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import type { DocIndexEntry } from "../../Models";
import {
  cmdQuery,
  filterDocs,
  landingVm,
  libraryOpen,
} from "../../ViewModels/LandingViewModel";
import { MONO_LABEL_STYLE, NOIR, NOIR_TEXT } from "../theme";

const CmdPaletteComponent = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();

  const openDoc = (href: string) => {
    landingVm.closeLibrary();
    router.push(localizedPath(locale, href));
  };

  const row = (item: DocIndexEntry) =>
    Container()
      .key(item.num)
      .props({ role: "listitem" })
      .children([
        Box()
          .key("row")
          .style(NOIR.lbmRow)
          .hover((h) => {
            h.bg("rgba(255, 255, 255, 0.05)");
          })
          .transition("background", 180, "ease-out")
          .props({
            role: "link",
            tabIndex: 0,
            onKeyDown: (e: { key: string }) => {
              if (e.key === "Enter") openDoc(item.href);
            },
          })
          .onClick(() => openDoc(item.href))
          .children([
            Text(item.num)
              .key("num")
              .variant("caption")
              .style(NOIR_TEXT.lbmNum),
            Container()
              .key("body")
              .children([
                Text(item.title)
                  .key("name")
                  .variant("caption")
                  .style({ ...NOIR_TEXT.lbmName, display: "block" }),
                Text(item.desc)
                  .key("desc")
                  .variant("caption")
                  .style({ ...NOIR_TEXT.lbmDesc, display: "block" }),
              ]),
            Text(`${item.tag} →`)
              .key("tag")
              .variant("caption")
              .style(NOIR_TEXT.lbmTag),
          ]),
      ]);

  const sheet = () =>
    Container()
      .key("sheet")
      .style(NOIR.lbmSheet)
      .children([
        Row()
          .key("bar")
          .style(NOIR.lbmBar)
          .crossAxisAlignment("center")
          .mainAxisAlignment("spaceBetween")
          .children([
            Text(t.landing.cmdIndexTitle)
              .key("title")
              .variant("caption")
              .id("lbm-title")
              .style(NOIR_TEXT.inherit),
            Button("ESC")
              .key("esc")
              .clean()
              .style(MONO_LABEL_STYLE)
              .onPress(() => landingVm.closeLibrary()),
          ]),

        Container()
          .key("search")
          .style(NOIR.lbmSearchRow)
          .children([
            TextField()
              .value(cmdQuery)
              .variant("outlined")
              .placeholder(t.landing.cmdSearchPlaceholder)
              .style({
                height: "auto",
                border: "none",
                borderRadius: 0,
                background: "transparent",
                width: "100%",
                color: "var(--ink)",
                fontSize: 14,
              })
              .props({
                type: "search",
                autoFocus: true,
                "aria-label": t.landing.cmdSearchAria,
              }),
          ]),

        Container()
          .key("scroll")
          .style(NOIR.lbmScroll)
          .children([
            Box()
              .style(NOIR.lbmList)
              .props({ role: "list" })
              .bindSignal(cmdQuery)
              .children(() => filterDocs(cmdQuery.value, t.docs.library).map(row)),
          ]),
      ]);

  return Box()
    .bindSignal(libraryOpen)
    .children(() =>
      libraryOpen.value
        ? [
            Container()
              .key("backdrop")
              .style(NOIR.lbmBackdrop)
              .props({
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": "lbm-title",
              })
              .onClick((e: { target: EventTarget | null; currentTarget: EventTarget }) => {
                if (e.target === e.currentTarget) landingVm.closeLibrary();
              })
              .children([sheet()]),
          ]
        : [],
    )
    .build();
};

export const CmdPalette = Component()(CmdPaletteComponent);
