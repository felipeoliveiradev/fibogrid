"use client";

import Link from "next/link";
import { Badge, Column, Row, Text } from "fiboui";
import {
  DocsChapterNav,
  DocsLabel,
  type DocsChapter,
} from "@/components/DocsArticleClient";

const pad = (n: number) => String(n).padStart(2, "0");

type DocsIndexClientProps = {
  docs: DocsChapter[];
};

export function DocsIndexClient({ docs }: DocsIndexClientProps) {
  return (
    <main className="dc-shell">
      <div className="dc-grid">
        <DocsChapterNav chapters={docs} />

        <article className="dc-article">
          {Column()
            .hug()
            .crossAxisAlignment("stretch")
            .children([
              <DocsLabel key="label">SPECIMEN MANUAL // FIBOGRID V1.0.31</DocsLabel>,

              <div key="prose" className="dc-prose">
                <h1>
                  technical documentation
                  <span className="period" aria-hidden="true" />
                </h1>
                <p>
                  Complete architectural manual and API reference for{" "}
                  <code>fibogrid@1.0.31</code>. Select any chapter below to inspect
                  TypeScript interfaces, virtualisation internals, and copy-pasteable
                  React 18 / 19 integration patterns.
                </p>
              </div>,

              Row()
                .key("meta")
                .hug()
                .style({ gap: 8, marginTop: 20 })
                .children([
                  Badge().text(`${docs.length} chapters`).variant("outline"),
                  Badge().text("React 18 / 19").variant("outline"),
                  Badge().text("TypeScript").variant("outline"),
                ]),

              Column()
                .key("sheet")
                .className("swiss-spec-sheet dc-spec-sheet")
                .crossAxisAlignment("stretch")
                .style({ marginTop: 28, border: "1px solid var(--rule-ink)" })
                .children(
                  docs.map((doc, idx) => (
                    <Link key={doc.href} className="swiss-spec-row" href={doc.href}>
                      {Text(`CH // ${pad(idx + 1)}`)
                        .className("swiss-spec-idx")
                        .build()}
                      {Text(doc.title).className("swiss-spec-title").build()}
                      {Text(`/${doc.slug.join("/")}`)
                        .className("swiss-spec-desc")
                        .build()}
                      {Text("READ CHAPTER →").className("swiss-spec-metric").build()}
                    </Link>
                  )),
                ),
            ])
            .build()}
        </article>
      </div>
    </main>
  );
}
