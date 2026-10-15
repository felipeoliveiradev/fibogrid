"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Card, Column, Text } from "fiboui";

export type DocsChapter = {
  slug: string[];
  title: string;
  href: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Mono "swiss" label rendered through FiboUI Text. */
export function DocsLabel({ children, mb = 10 }: { children: string; mb?: number }) {
  return Text(children)
    .variant("label")
    .className("swiss-label")
    .style({ display: "block", marginBottom: mb })
    .build();
}

type ChapterNavProps = {
  chapters: DocsChapter[];
  /** Active chapter href; omit on the index page. */
  currentHref?: string;
};

/** Sidebar chapter list — shared by the docs index and article pages. */
export function DocsChapterNav({ chapters, currentHref }: ChapterNavProps) {
  const isIndex = currentHref === undefined;

  return (
    <aside className="dc-aside" aria-label="Documentation chapters">
      {Card()
        .className("dc-group")
        .css({
          background: "transparent",
          border: "none",
          boxShadow: "none",
          padding: 0,
        })
        .children([
          Column()
            .hug()
            .crossAxisAlignment("start")
            .children([
              isIndex ? (
                <span
                  key="head"
                  style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}
                >
                  <span className="swiss-label">CHAPTER INDEX</span>
                  {Badge().text(String(chapters.length)).variant("outline").build()}
                </span>
              ) : (
                <Link
                  key="back"
                  href="/docs"
                  className="swiss-label"
                  style={{
                    display: "inline-block",
                    color: "var(--signal)",
                    marginBottom: 14,
                  }}
                >
                  ← ALL CHAPTERS
                </Link>
              ),
              <ul key="list" className="dc-nav-list">
                {chapters.map((item, idx) => {
                  const active = item.href === currentHref;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="dc-nav-link"
                        aria-current={active ? "page" : undefined}
                      >
                        <span className="dc-nav-num">{pad(idx + 1)}</span>
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>,
            ]),
        ])
        .build()}
    </aside>
  );
}

type DocsArticleClientProps = {
  chapters: DocsChapter[];
  currentHref: string;
  slug: string[];
  /** Server-rendered markdown body. */
  children: ReactNode;
};

/** Chrome for a single docs chapter; markdown body is passed in as children. */
export function DocsArticleClient({
  chapters,
  currentHref,
  slug,
  children,
}: DocsArticleClientProps) {
  return (
    <main className="dc-shell">
      <div className="dc-grid">
        <DocsChapterNav chapters={chapters} currentHref={currentHref} />

        <article className="dc-article dc-prose">
          {Column()
            .hug()
            .crossAxisAlignment("stretch")
            .children([
              <DocsLabel key="label">
                {`MANUAL CHAPTER // ${slug.join(" / ").toUpperCase()}`}
              </DocsLabel>,
              <div key="body">{children}</div>,
            ])
            .build()}
        </article>
      </div>
    </main>
  );
}
