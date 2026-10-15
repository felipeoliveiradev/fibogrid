"use client";

import { Box, Button, Component, Text } from "fiboui";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/locale-context";
import type { DocsChapter } from "../../Models";
import { DOCS } from "../theme/docs.theme";

type DocsPagerProps = {
  prev?: DocsChapter;
  next?: DocsChapter;
};

export const DocsPager = Component()((props: DocsPagerProps) => {
  const router = useRouter();
  const t = useT();
  const { prev, next } = props;

  if (!prev && !next) return Box().key("pager-empty").build();

  return Box()
    .key("pager")
    .style(DOCS.pager)
    .className("dc-pager")
    .children([
      prev
        ? Button()
            .key("prev")
            .variant("raw")
            .style(DOCS.pagerCard)
            .hover((h) => {
              h.bg("rgba(255,255,255,0.04)").borderColor("var(--border-mid)");
            })
            .transition(["background", "border-color"], 180, "ease-out")
            .onPress(() => router.push(prev.href))
            .children([
              Text(t.docs.previous)
                .key("h")
                .variant("caption")
                .style(DOCS.pagerHint)
                .build(),
              Text(prev.title).key("t").variant("caption").style(DOCS.pagerTitle).build(),
            ])
            .build()
        : Box().key("prev-empty").build(),
      next
        ? Button()
            .key("next")
            .variant("raw")
            .style({ ...DOCS.pagerCard, alignItems: "flex-end", textAlign: "right" })
            .hover((h) => {
              h.bg("rgba(255,255,255,0.04)").borderColor("var(--border-mid)");
            })
            .transition(["background", "border-color"], 180, "ease-out")
            .onPress(() => router.push(next.href))
            .children([
              Text(t.docs.next).key("h").variant("caption").style(DOCS.pagerHint).build(),
              Text(next.title).key("t").variant("caption").style(DOCS.pagerTitle).build(),
            ])
            .build()
        : Box().key("next-empty").build(),
    ])
    .build();
});
