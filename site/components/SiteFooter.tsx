"use client";

import { Column, Container, Row, Text, type FiboChild } from "fiboui";
import Link from "next/link";

interface SiteFooterProps {
  onOpenLibrary?: () => void;
}

/** Column heading + vertical link list (CSS hooks: `ft-col-h`, `ft-list`). */
function linkColumn(key: string, title: string, items: FiboChild[]) {
  return Column()
    .key(key)
    .crossAxisAlignment("start")
    .children([
      Text(title)
        .key("title")
        .type("h3")
        .className("ft-col-h")
        .style({ marginBottom: 16 }),
      Column()
        .key("list")
        .className("ft-list")
        .crossAxisAlignment("start")
        .children(items),
    ]);
}

export function SiteFooter({ onOpenLibrary }: SiteFooterProps) {
  const brandBlock = Column()
    .key("brand")
    .crossAxisAlignment("start")
    .children([
      <Link
        key="brand-link"
        className="nv-brand"
        href="/"
        style={{ marginBottom: 16 }}
      >
        <span className="nv-brand-dot" aria-hidden="true" />
        {Text("FIBOGRID").type("caption").build()}
      </Link>,
      Text(
        "High-density React 18 & 19 data grid proportioned on the Fibonacci spatial sequence (φ = 1.618). Dual-axis DOM windowing, transactional state mutations, and inter-grid event orchestration.",
      )
        .key("blurb")
        .type("body")
        .className("noir-copy")
        .style({ maxWidth: "34ch", marginTop: 14 }),
    ]);

  const specimens = linkColumn("specimens", "Live Specimens", [
    <a key="hero" href="/#hero-specimen">
      Hero Orderbook Grid
    </a>,
    <a key="workbench" href="/#workbench">
      100K Live Workbench
    </a>,
    <a key="linked" href="/#linked-grids">
      Linked Registry Bus
    </a>,
    <a key="faq" href="/#faq">
      Engineering Q&amp;A
    </a>,
  ]);

  const docs = linkColumn("docs", "Documentation", [
    onOpenLibrary ? (
      <a
        key="search"
        href="/docs"
        onClick={(e) => {
          e.preventDefault();
          onOpenLibrary();
        }}
      >
        Command Search (⌘K)
      </a>
    ) : (
      <Link key="index" href="/docs">
        Documentation Index
      </Link>
    ),
    <Link key="overview" href="/docs/01-overview">
      01 · System Overview
    </Link>,
    <Link key="hooks" href="/docs/03-hooks">
      03 · Virtualization Hooks
    </Link>,
    <Link key="api" href="/docs/05-api">
      05 · GridApi &amp; Manager
    </Link>,
  ]);

  const distribution = linkColumn("distribution", "Distribution", [
    <a
      key="npm"
      href="https://www.npmjs.com/package/fibogrid"
      target="_blank"
      rel="noopener noreferrer"
    >
      npm · fibogrid@1.0.31 ↗
    </a>,
    <a
      key="github"
      href="https://github.com/felipeoliveiradev/fibogrid"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitHub Repository ↗
    </a>,
    Text("React 18 / 19 · TypeScript 5").key("stack").type("caption"),
    Text("MIT Open Source License").key("license").type("caption"),
  ]);

  const grid = Container()
    .key("grid")
    .className("ft-grid")
    .children([brandBlock, specimens, docs, distribution]);

  const bottom = Row()
    .key("bottom")
    .className("ft-bottom")
    .children([
      Text("© 2026 FIBOGRID · Engineered by Felipe Oliveira")
        .key("copyright")
        .type("caption"),
      Text("Fibonacci Spatial System (φ = 1.6180339) · Real Mounted FiboGrid")
        .key("system")
        .type("caption"),
    ]);

  return Column()
    .className("ft")
    .props({ role: "contentinfo" })
    .crossAxisAlignment("stretch")
    .children([
      Column()
        .className("noir-wrap")
        .crossAxisAlignment("stretch")
        .children([grid, bottom]),
    ])
    .build();
}
