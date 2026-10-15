"use client";

import { Box, Column, Component, Text } from "fiboui";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/locale-context";
import { CmdPalette } from "@/modules/landing/Views/components/CmdPalette";
import type { DocsChapter } from "../Models";
import {
  adjacentChapters,
  displayChapterTitle,
  sectionLabelFromSlug,
} from "../ViewModels";
import { DocsHeader } from "./components/DocsHeader";
import { DocsPager } from "./components/DocsPager";
import { DocsSidebar } from "./components/DocsSidebar";
import { DOCS } from "./theme/docs.theme";

export type DocsArticlePageProps = {
  chapters: DocsChapter[];
  currentHref: string;
  slug: string[];
  title?: string;
  body: ReactNode;
};

const DocsArticlePageComponent = (props: DocsArticlePageProps) => {
  const t = useT();
  const { chapters, currentHref, slug, title, body } = props;
  const { prev, next } = adjacentChapters(chapters, currentHref);
  const rawTitle =
    title ?? chapters.find((c) => c.href === currentHref)?.title ?? slug.join(" / ");
  const chapterTitle = displayChapterTitle(rawTitle);
  const section = sectionLabelFromSlug(slug[0] ?? "docs", t.docs.sections);

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
              DocsSidebar({ chapters, currentHref }),
              Box()
                .props({ role: "article" })
                .style(DOCS.article)
                .className("dc-article dc-prose")
                .children([
                  Column()
                    .hug()
                    .crossAxisAlignment("stretch")
                    .children([
                      Text(section)
                        .key("kicker")
                        .variant("caption")
                        .style(DOCS.kicker)
                        .build(),
                      Text(chapterTitle)
                        .key("title")
                        .variant("h1")
                        .style(DOCS.heroTitle)
                        .className("dc-article-title")
                        .build(),
                      Box().key("body").children([body]).build(),
                      DocsPager({
                        prev: prev
                          ? { ...prev, title: displayChapterTitle(prev.title) }
                          : undefined,
                        next: next
                          ? { ...next, title: displayChapterTitle(next.title) }
                          : undefined,
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

export const DocsArticlePage = Component()(DocsArticlePageComponent);
