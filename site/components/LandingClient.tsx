"use client";

import { Badge, Button, Column, Container, Grid, Row, Text } from "fiboui";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Faq } from "./Faq";
import {
  HeroOrderbookSpecimen,
  LinkedRegistrySpecimen,
  MainWorkbenchSpecimen,
  RealFiboGridProvider,
} from "./RealFiboGridShowcase";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

interface DocIndexEntry {
  num: string;
  title: string;
  desc: string;
  tag: string;
  href: string;
}

const DOC_LIBRARY: DocIndexEntry[] = [
  {
    num: "01",
    title: "System Overview & Capabilities",
    desc: "Fibonacci spatial architecture, core props, and dual-axis virtualization.",
    tag: "OVERVIEW",
    href: "/docs/01-overview",
  },
  {
    num: "02",
    title: "TypeScript Types & Column Contracts",
    desc: "ColumnDef, RowNode, GridIngress, GridEgress, and strongly-typed cell contracts.",
    tag: "TYPES",
    href: "/docs/02-types",
  },
  {
    num: "03",
    title: "Virtualization & State Hooks",
    desc: "useFiboGrid, useVirtualizer, useGridSortFilter, and useCellSelection.",
    tag: "HOOKS",
    href: "/docs/03-hooks",
  },
  {
    num: "04",
    title: "Components & Special Renderers",
    desc: "GridToolbar, FilterPopover, ColumnPanel, StatusBadge, and ProgressBar.",
    tag: "COMPONENTS",
    href: "/docs/04-components",
  },
  {
    num: "05",
    title: "Imperative GridApi & Manager",
    desc: "Transactional manager().upAdd().update().remove().execute() and params().",
    tag: "API",
    href: "/docs/05-api",
  },
  {
    num: "06",
    title: "Ingress/Egress, Registry & Grouping",
    desc: "GridRegistryProvider, Ingress/Egress security rules, grouping, and server-side.",
    tag: "ADVANCED",
    href: "/docs/06-advanced",
  },
  {
    num: "07",
    title: "Quick Start & Installation",
    desc: "Zero-config setup for Next.js App Router, Vite, and TypeScript 5.",
    tag: "GUIDE",
    href: "/docs/guides/usage",
  },
  {
    num: "08",
    title: "CSS Variable Matrix & Themes",
    desc: "Customizing --fibogrid-* tokens, Noir Dark, Uber, Apple, and Excel.",
    tag: "THEMING",
    href: "/docs/guides/theming",
  },
  {
    num: "09",
    title: "Architecture Patterns & Recipes",
    desc: "Master-detail grids, real-time streaming updates, and enterprise workflows.",
    tag: "PATTERNS",
    href: "/docs/08-patterns",
  },
  {
    num: "10",
    title: "Complete Documentation Index",
    desc: "Browse all 15 engineering chapters and API specifications.",
    tag: "ALL DOCS",
    href: "/docs",
  },
];

const ARCHITECTURE_CARDS = [
  [
    {
      title: "Virtualization Engine",
      desc: "Step into O(1) prefix-sum DOM windowing designed to render 100,000+ rows smoothly while mounting fewer than 48 DOM nodes.",
      href: "/docs/03-hooks",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M3 10h18M9 15h6" />
        </svg>
      ),
    },
    {
      title: "Transactional Manager",
      desc: "Enhance real-time state throughput with gridApi.manager().upAdd().update().remove().execute() delta mutations.",
      href: "/docs/05-api",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8l3.5 6h-7L12 8z" />
        </svg>
      ),
    },
    {
      title: "Inter-Grid Registry & Security",
      desc: "Orchestrate multi-grid workspaces with GridRegistryProvider, Ingress/Egress permissions, and useGridEvents() streams.",
      href: "/docs/06-advanced",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="6" width="16" height="12" rx="3" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <path d="M10.5 12h3" />
        </svg>
      ),
    },
  ],
  [
    {
      title: "Fibonacci Proportions",
      desc: "Every row cadence (21 / 34 / 55 px), header height, and cell inset is locked to the Golden Ratio (φ = 1.618).",
      href: "/docs/01-overview",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 20h16V4H4v16zM14 4v16M14 14h6" />
        </svg>
      ),
    },
    {
      title: "Grouping & Aggregations",
      desc: "Group by multiple columns on the fly with automatic sum, avg, min, max, and count rollups plus child row splits.",
      href: "/docs/06-advanced",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 6h16M7 12h13M10 18h10" />
        </svg>
      ),
    },
    {
      title: "2D Range & Clipboard",
      desc: "Drag-select rectangular cell ranges, edit inline with synchronous validation, and export directly to CSV or Excel.",
      href: "/docs/guides/usage",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
  ],
];

const VOICES_CARDS = [
  {
    quote:
      "FiboGrid completely transformed the way we stream and mutate 100k+ orderbook rows without triggering parent React re-renders.",
    author: "Quantitative Execution Desk · SIX / NASDAQ",
    badge: "φ 01",
    href: "/docs/05-api",
  },
  {
    quote:
      "Our team adopted GridRegistryProvider and useGridEvents() to link master-detail blotters with zero Redux or Context boilerplate.",
    author: "Platform Architecture · Multi-Grid Workspace",
    badge: "φ 02",
    href: "/docs/06-advanced",
  },
  {
    quote:
      "Having every row height (21 / 34 / 55 px) and cell gutter proportioned on the Fibonacci sequence makes dense tables effortless to scan.",
    author: "Design Systems Engineering · React 19",
    badge: "φ 03",
    href: "/docs/guides/theming",
  },
];

const PILL_STYLE = {
  padding: "5px 18px",
  borderRadius: 999,
  border: "1px solid rgba(255, 255, 255, 0.16)",
  backgroundColor: "rgba(255, 255, 255, 0.015)",
  color: "var(--ink-2)",
  fontSize: 11.5,
} as const;

const MONO_LABEL_STYLE = {
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  color: "var(--ink-2)",
} as const;

/**
 * Display typography helpers — package `noir` theme covers default Text vars;
 * these remain for font-display / --ink site tokens.
 */
const NOIR_TEXT = {
  h1: { fontSize: "clamp(38px, 4.4vw, 60px)", fontWeight: 300, letterSpacing: "0.03em" },
  h2: { fontSize: "clamp(28px, 3.2vw, 44px)", fontWeight: 300, letterSpacing: "0.03em" },
  copy: { fontSize: 13.5, color: "var(--ink-3)" },
  cardTitle: { fontSize: 16, fontWeight: 500, letterSpacing: "0.01em" },
  cardDesc: { fontSize: 13, color: "var(--ink-3)" },
  quote: { fontSize: 13, color: "var(--ink-3)" },
  author: { fontSize: 13.5, fontWeight: 500, color: "var(--ink)" },
  inherit: { fontSize: "inherit", color: "inherit", letterSpacing: "inherit" },
  lbmNum: { fontSize: 11, color: "var(--ink-3)", letterSpacing: "normal" },
  lbmName: { fontSize: 13.5, fontWeight: 500, color: "var(--ink)", letterSpacing: "normal" },
  lbmDesc: { fontSize: 12, color: "var(--ink-3)", letterSpacing: "normal" },
  lbmTag: { fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "normal" },
} as const;

/** Page section: FiboUI Column (stretch) that keeps the noir section class + anchor id. */
function sectionColumn(opts: {
  className: string;
  id?: string;
  labelledBy?: string;
}) {
  return Column()
    .className(opts.className)
    .crossAxisAlignment("stretch")
    .props({
      role: "region",
      ...(opts.id ? { id: opts.id } : {}),
      ...(opts.labelledBy ? { "aria-labelledby": opts.labelledBy } : {}),
    });
}

export function LandingClient() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [servicePage, setServicePage] = useState<0 | 1>(0);

  const openLibrary = () => setLibraryOpen(true);
  const closeLibrary = () => setLibraryOpen(false);
  const toggleServicePage = () => setServicePage((p) => (p === 0 ? 1 : 0));

  const handleCopyInstall = () => {
    navigator.clipboard?.writeText("npm install fibogrid");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 1600);
  };

  const filteredDocs = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return DOC_LIBRARY;
    return DOC_LIBRARY.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.desc.toLowerCase().includes(q) ||
        d.tag.toLowerCase().includes(q)
    );
  }, [cmdQuery]);

  const activeServiceCards = ARCHITECTURE_CARDS[servicePage];

  /* ===================================================================
     SECTION 01 — HERO
     Left: real mounted <FiboGrid /> · Right: editorial copy + CTAs
     =================================================================== */
  const hero = sectionColumn({
    className: "hero-section",
    labelledBy: "hero-title",
  }).children([
    Container()
      .className("noir-wrap")
      .children([
        Grid()
          .className("hero-grid")
          .columns(2)
          .children([
            <HeroOrderbookSpecimen key="hero-specimen" />,

            Column()
              .className("hero-copy-col")
              .crossAxisAlignment("start")
              .children([
                Text("THE DIGITAL\nFRONTIER OF\nDATA GRIDS")
                  .variant("h1")
                  .className("noir-h1")
                  .id("hero-title")
                  .style({ ...NOIR_TEXT.h1, whiteSpace: "pre-line" }),

                Row()
                  .className("hero-pill-row")
                  .props({ role: "group", "aria-label": "Core specifications" })
                  .children(
                    ["Fibonacci φ 1.618", "100K Rows", "React 19"].map((label) =>
                      Badge()
                        .key(label)
                        .className("noir-pill")
                        .variant("outline")
                        .shape("pill")
                        .text(label)
                        .style(PILL_STYLE)
                    )
                  ),

                // Inline <code> needs rich children, which Text() does not accept.
                <p key="hero-copy" className="noir-copy" style={{ maxWidth: "42ch" }}>
                  Step into the next frontier of high-density React interfaces,
                  where dual-axis O(1) virtualization meets Fibonacci spatial
                  proportions, transactional{" "}
                  <code style={{ color: "#F4F4F6" }}>gridApi.manager()</code>{" "}
                  mutations, and an inter-grid event bus.
                </p>,

                Row()
                  .className("hero-actions-row")
                  .crossAxisAlignment("center")
                  .children([
                    Button(
                      copiedInstall
                        ? "Copied: npm i fibogrid"
                        : "Learn More · npm i fibogrid"
                    )
                      .clean()
                      .className("btn-noir-rect")
                      .onPress(handleCopyInstall),

                    <Link key="play" className="btn-noir-play" href="#workbench">
                      <span className="play-circle-icon" aria-hidden="true">
                        ▶
                      </span>
                      <span>Interactive 100K Demo</span>
                    </Link>,
                  ]),
              ]),
          ]),
      ]),
  ]);

  /* ===================================================================
     SECTION 02 — OUR ARCHITECTURE (paged service cards)
     =================================================================== */
  const architecture = sectionColumn({
    className: "services-section",
    id: "architecture",
    labelledBy: "arch-title",
  }).children([
    Container()
      .className("noir-wrap")
      .children([
        Row()
          .className("section-bar")
          .crossAxisAlignment("center")
          .mainAxisAlignment("spaceBetween")
          .children([
            Text("OUR ARCHITECTURE")
              .variant("h2")
              .className("noir-h2")
              .id("arch-title")
              .style(NOIR_TEXT.h2),

            Row()
              .className("circle-nav-group")
              .hug()
              .crossAxisAlignment("center")
              .props({ "aria-label": "Switch architecture cards" })
              .children([
                Button("‹")
                  .clean()
                  .className("circle-nav-btn")
                  .props({ "aria-label": "Previous capabilities" })
                  .onPress(toggleServicePage),
                Button("›")
                  .clean()
                  .className("circle-nav-btn")
                  .props({ "aria-label": "Next capabilities" })
                  .onPress(toggleServicePage),
              ]),
          ]),

        Grid()
          .className("service-cards-grid")
          .columns(3)
          .children(
            activeServiceCards.map((card) =>
              Column()
                .key(card.title)
                .className("service-card")
                .props({ role: "article" })
                .children([
                  Container()
                    .className("service-icon-badge")
                    .props({ "aria-hidden": "true" })
                    .children([card.icon]),
                  Text(card.title)
                    .variant("h3")
                    .className("service-card-title")
                    .style({ ...NOIR_TEXT.cardTitle, marginBottom: 14 }),
                  Text(card.desc)
                    .variant("body")
                    .className("service-card-desc")
                    .style({ ...NOIR_TEXT.cardDesc, marginBottom: 32 }),
                  <Link key="link" className="service-card-link" href={card.href}>
                    Learn More
                  </Link>,
                ])
            )
          ),
      ]),
  ]);

  /* ===================================================================
     SECTION 04 — VOICES / ECOSYSTEM
     =================================================================== */
  const ecosystem = sectionColumn({
    className: "voices-section",
    id: "ecosystem",
    labelledBy: "voices-title",
  }).children([
    // Subtle sweeping background curve
    <svg
      key="curve"
      className="voices-curve-svg"
      viewBox="0 0 1440 520"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M-80 430 C 320 460, 560 390, 760 250 C 960 110, 1180 140, 1520 310"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2.5"
      />
    </svg>,

    Container()
      .className("noir-wrap")
      .children([
        Grid()
          .className("voices-grid")
          .columns(2)
          .children([
            Column()
              .key("voices-left")
              .className("voices-left")
              .crossAxisAlignment("stretch")
              .children([
                Text("VOICES OF THE\nARCHITECTURE")
                  .variant("h2")
                  .className("noir-h2")
                  .id("voices-title")
                  .style({ ...NOIR_TEXT.h2, whiteSpace: "pre-line" }),

                Container()
                  .className("voices-divider")
                  .props({ "aria-hidden": "true" }),

                Text(
                  "Here you'll find how engineering teams, quantitative desks, and design-system architects use FiboGrid to build next-generation high-density React applications without sacrificing scroll responsiveness."
                )
                  .variant("body")
                  .className("noir-copy")
                  .style({ ...NOIR_TEXT.copy, maxWidth: "46ch" }),

                Row()
                  .style({ marginTop: 28 })
                  .spacing(14)
                  .crossAxisAlignment("center")
                  .children([
                    <Link key="docs" className="btn-noir-rect" href="/docs">
                      Read 33 Docs Chapters
                    </Link>,
                    Button()
                      .clean()
                      .className("btn-noir-play")
                      .onPress(openLibrary)
                      .children([
                        Container()
                          .className("play-circle-icon")
                          .props({ "aria-hidden": "true" })
                          .children(["⌘"]),
                        Text("Open Command Index")
                          .variant("caption")
                          .style(NOIR_TEXT.inherit),
                      ]),
                  ]),
              ]),

            Column()
              .key("voices-stack")
              .className("voices-stack")
              .crossAxisAlignment("stretch")
              .children(
                VOICES_CARDS.map((card) => (
                  <Link key={card.badge} href={card.href} className="voice-card">
                    {Column()
                      .className("voice-card-body")
                      .crossAxisAlignment("start")
                      .children([
                        Text(card.quote)
                          .variant("body")
                          .className("voice-card-quote")
                          .style(NOIR_TEXT.quote),
                        Text(card.author)
                          .variant("caption")
                          .className("voice-card-author")
                          .style(NOIR_TEXT.author),
                      ])
                      .build()}
                    {Container()
                      .className("voice-avatar-circle")
                      .props({ "aria-hidden": "true" })
                      .children([card.badge])
                      .build()}
                  </Link>
                ))
              ),
          ]),
      ]),
  ]);

  /* ===================================================================
     ⌘K COMMAND & DOCUMENTATION PALETTE
     =================================================================== */
  const libraryModal = libraryOpen
    ? Container()
        .className("lbm-backdrop")
        .props({
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "lbm-title",
        })
        .onClick((e: { target: EventTarget | null; currentTarget: EventTarget }) => {
          if (e.target === e.currentTarget) closeLibrary();
        })
        .children([
          Container()
            .className("lbm-sheet")
            .children([
              Row()
                .className("lbm-bar")
                .crossAxisAlignment("center")
                .mainAxisAlignment("spaceBetween")
                .children([
                  Text("FIBOGRID DOCUMENTATION INDEX · v1.0.31")
                    .variant("caption")
                    .id("lbm-title")
                    .style(NOIR_TEXT.inherit),
                  Button("ESC")
                    .clean()
                    .style(MONO_LABEL_STYLE)
                    .onPress(closeLibrary),
                ]),

              Container()
                .className("lbm-search-row")
                .children([
                  // Plain input: controlled + autoFocus, no floating-label chrome.
                  <input
                    key="search"
                    type="search"
                    className="lbm-search-input"
                    placeholder="Search chapters, hooks, GridApi methods, or guides..."
                    value={cmdQuery}
                    onChange={(e) => setCmdQuery(e.target.value)}
                    autoFocus
                  />,
                ]),

              Container()
                .className("lbm-scroll")
                .children([
                  Container()
                    .className("lbm-list")
                    .props({ role: "list" })
                    .children(
                      filteredDocs.map((item) =>
                        Container()
                          .key(item.num)
                          .props({ role: "listitem" })
                          .children([
                            <Link
                              key="row"
                              className="lbm-row"
                              href={item.href}
                              onClick={closeLibrary}
                            >
                              {Text(item.num)
                                .variant("caption")
                                .className("lbm-num")
                                .style(NOIR_TEXT.lbmNum)
                                .build()}
                              {Container()
                                .children([
                                  Text(item.title)
                                    .variant("caption")
                                    .className("lbm-name")
                                    .style(NOIR_TEXT.lbmName),
                                  Text(item.desc)
                                    .variant("caption")
                                    .className("lbm-desc")
                                    .style(NOIR_TEXT.lbmDesc),
                                ])
                                .build()}
                              {Text(`${item.tag} →`)
                                .variant("caption")
                                .className("lbm-tag")
                                .style(NOIR_TEXT.lbmTag)
                                .build()}
                            </Link>,
                          ])
                      )
                    ),
                ]),
            ]),
        ])
        .build()
    : null;

  /* ===================================================================
     PAGE SHELL
     =================================================================== */
  return (
    <RealFiboGridProvider>
      {Column()
        .className("landing-shell")
        .crossAxisAlignment("stretch")
        .children([
          <SiteNav key="nav" onOpenLibrary={openLibrary} />,

          Column()
            .key("main")
            .className("landing-main")
            .crossAxisAlignment("stretch")
            .props({ role: "main" })
            .children([
              hero,
              architecture,
              // SECTION 03 — workbench (#workbench lives inside the specimen)
              <MainWorkbenchSpecimen key="workbench" />,
              ecosystem,
              // SECTION 05 — inter-grid registry
              <LinkedRegistrySpecimen key="registry" />,
              // SECTION 06 — FAQ
              <Faq key="faq" />,
            ]),

          <SiteFooter key="footer" onOpenLibrary={openLibrary} />,
          libraryModal,
        ])
        .build()}
    </RealFiboGridProvider>
  );
}
