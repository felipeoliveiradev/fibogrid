"use client";

import { Box, Button, Column, Component, Text } from "fiboui";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/locale-context";
import { CmdPalette } from "@/modules/landing/Views/components/CmdPalette";
import type { DocsChapter } from "../Models";
import {
  chapterPathLabel,
  displayChapterTitle,
  groupDocsChapters,
} from "../ViewModels";
import { DocsHeader } from "./components/DocsHeader";
import { DocsSidebar } from "./components/DocsSidebar";
import { DOCS } from "./theme/docs.theme";

export type DocsIndexPageProps = {
  docs: DocsChapter[];
};

const DocsIndexPageComponent = (props: DocsIndexPageProps) => {
  const router = useRouter();
  const t = useT();
  const { docs } = props;
  const sections = groupDocsChapters(docs, t.docs.sections);

  return Box()
    .theme("noir")
    .style(DOCS.frame)
    .className("dc-frame")
    .children([
      DocsHeader(),
      Box()
        .props({ role: "main" })
        .style(DOCS.shell)
        .className("dc-shell")
        .children([
          Box()
            .className("dc-grid")
            .style(DOCS.grid)
            .children([
              DocsSidebar({ chapters: docs }),
              Box()
                .props({ role: "article" })
                .style(DOCS.article)
                .className("dc-article")
                .children([
                  Column()
                    .hug()
                    .crossAxisAlignment("stretch")
                    .children([
                      Text(t.docs.indexKicker)
                        .key("kicker")
                        .variant("caption")
                        .style(DOCS.kicker)
                        .build(),
                      Text(t.docs.indexTitle)
                        .key("title")
                        .variant("h1")
                        .style(DOCS.heroTitle)
                        .build(),
                      Text(t.docs.indexLead)
                        .key("lead")
                        .variant("body")
                        .style(DOCS.heroLead)
                        .build(),

                      Box()
                        .key("quickstart")
                        .style(DOCS.callout)
                        .children([
                          Text(t.docs.quickStartTitle)
                            .key("t")
                            .variant("caption")
                            .style(DOCS.calloutTitle)
                            .build(),
                          Text(t.docs.quickStartBody)
                            .key("b")
                            .variant("body")
                            .style(DOCS.calloutBody)
                            .build(),
                          Text("npm install fibogrid")
                            .key("c")
                            .variant("caption")
                            .style(DOCS.calloutCode)
                            .build(),
                        ])
                        .build(),

                      ...sections.flatMap((section, sIdx) => {
                        const head = Text(section.label)
                          .key(`h-${section.id}`)
                          .variant("caption")
                          .style({
                            ...DOCS.sectionHead,
                            ...(sIdx === 0 ? DOCS.sectionHeadFirst : {}),
                          })
                          .build();

                        const rows = section.items.map((doc) =>
                          Button()
                            .key(doc.href)
                            .variant("raw")
                            .className("dc-index-row")
                            .style(DOCS.chapterRow)
                            .hover((h) => {
                              h.color("var(--ink)");
                            })
                            .transition("color", 150, "ease-out")
                            .onPress(() => router.push(doc.href))
                            .children([
                              Box()
                                .key("copy")
                                .children([
                                  Text(displayChapterTitle(doc.title))
                                    .key("title")
                                    .variant("caption")
                                    .style(DOCS.chapterTitle)
                                    .build(),
                                  Text(chapterPathLabel(doc))
                                    .key("path")
                                    .variant("caption")
                                    .style(DOCS.chapterPath)
                                    .build(),
                                ])
                                .build(),
                              Text(t.docs.open)
                                .key("go")
                                .variant("caption")
                                .style(DOCS.chapterGo)
                                .build(),
                            ])
                            .build(),
                        );

                        return [head, ...rows];
                      }),
                    ])
                    .build(),
                ])
                .build(),
            ])
            .build(),
        ])
        .build(),
      CmdPalette({ key: "cmd" }),
    ])
    .build();
};

export const DocsIndexPage = Component()(DocsIndexPageComponent);
