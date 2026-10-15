"use client";

import { Box, Button, Column, Component, Text } from "fiboui";
import { useRouter } from "next/navigation";
import { localizedPath } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import type { DocsChapter } from "../../Models";
import { displayChapterTitle, groupDocsChapters } from "../../ViewModels";
import { DOCS } from "../theme/docs.theme";

type DocsSidebarProps = {
  chapters: DocsChapter[];
  currentHref?: string;
};

export const DocsSidebar = Component()((props: DocsSidebarProps) => {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();
  const { chapters, currentHref } = props;
  const sections = groupDocsChapters(chapters, t.docs.sections);
  const onIndex = currentHref === undefined;

  return Box()
    .props({ role: "complementary", "aria-label": t.docs.documentation })
    .style(DOCS.aside)
    .className("dc-aside")
    .children([
      Column()
        .hug()
        .crossAxisAlignment("stretch")
        .children([
          Button(t.docs.allDocs)
            .key("all")
            .variant("raw")
            .className(onIndex ? "dc-nav-home is-active" : "dc-nav-home")
            .style({
              ...DOCS.navHome,
              ...(onIndex ? DOCS.navLinkActive : {}),
            })
            .hover((h) => {
              if (!onIndex) h.color("var(--ink)");
            })
            .transition("color", 150, "ease-out")
            .onPress(() => router.push(localizedPath(locale, "/docs")))
            .build(),

          ...sections.flatMap((section, sIdx) => {
            const label = Text(section.label)
              .key(`sec-${section.id}`)
              .variant("caption")
              .style({
                ...DOCS.asideLabel,
                ...(sIdx === 0 ? DOCS.asideLabelFirst : {}),
              })
              .build();

            const links = section.items.map((item) => {
              const active = currentHref === item.href;
              const title = displayChapterTitle(item.title);
              return Button(title)
                .key(item.href)
                .variant("raw")
                .className(active ? "dc-nav-link is-active" : "dc-nav-link")
                .style({
                  ...DOCS.navLink,
                  ...(active ? DOCS.navLinkActive : {}),
                })
                .hover((h) => {
                  if (!active) h.color("var(--ink)").bg("rgba(255,255,255,0.03)");
                })
                .transition(["background", "color", "border-color"], 150, "ease-out")
                .props(active ? { "aria-current": "page" as const } : {})
                .onPress(() => router.push(item.href))
                .build();
            });

            return [label, ...links];
          }),
        ]),
    ])
    .build();
});
