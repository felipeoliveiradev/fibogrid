"use client";

import { Button, Column, Header, Row, Text } from "fiboui";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface SiteNavProps {
  grounded?: boolean;
  onOpenLibrary?: () => void;
}

const GITHUB_URL = "https://github.com/felipeoliveiradev/fibogrid";
const INSTALL_CMD = "npm install fibogrid";

/** Desktop anchor links. `internal` → next/link, otherwise plain <a>. */
const DESKTOP_LINKS = [
  { key: "architecture", label: "Architecture", href: "/#architecture" },
  { key: "workbench", label: "100K Workbench", href: "/#workbench" },
  { key: "ecosystem", label: "Registry Bus", href: "/#ecosystem" },
  { key: "docs", label: "Documentation", href: "/docs", internal: true },
  { key: "github", label: "GitHub ↗", href: GITHUB_URL, external: true },
] as const;

export function SiteNav({ onOpenLibrary }: SiteNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!onOpenLibrary) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenLibrary();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenLibrary]);

  const handleCopyInstall = useCallback(() => {
    navigator.clipboard?.writeText(INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  /* ── brand ─────────────────────────────────────────────────────────── */
  const brand = (
    <Link key="brand" className="nv-brand" href="/">
      <span className="nv-brand-dot" aria-hidden="true" />
      {Text("FIBOGRID").type("caption").build()}
    </Link>
  );

  /* ── desktop links ─────────────────────────────────────────────────── */
  const links = Row()
    .className("nv-links")
    .hug()
    .crossAxisAlignment("center")
    .props({ role: "navigation", "aria-label": "Primary" })
    .children(
      DESKTOP_LINKS.map((item) => {
        if ("internal" in item) {
          return (
            <Link key={item.key} className="nv-link" href={item.href}>
              {item.label}
            </Link>
          );
        }
        if ("external" in item) {
          return (
            <a
              key={item.key}
              className="nv-link"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          );
        }
        return (
          <a key={item.key} className="nv-link" href={item.href}>
            {item.label}
          </a>
        );
      }),
    );

  /* ── desktop actions ───────────────────────────────────────────────── */
  const searchAction = onOpenLibrary ? (
    Button("Search Docs")
      .key("search")
      .variant("raw")
      .className("nv-pill-btn")
      .style({ fontWeight: 400 })
      .props({ title: "Open Command & Documentation Index (⌘K)" })
      .onPress(onOpenLibrary)
      .children([<kbd key="kbd">⌘K</kbd>])
  ) : (
    <Link key="docs-index" className="nv-pill-btn" href="/docs">
      {Text("Docs Index").type("caption").build()}
    </Link>
  );

  const actions = Row()
    .className("nv-actions")
    .hug()
    .crossAxisAlignment("center")
    .children([
      searchAction,
      Button(copied ? "Copied: npm i fibogrid" : "npm i fibogrid")
        .key("copy")
        .variant("raw")
        .className("nv-pill-btn")
        .style({ fontWeight: 400 })
        .onPress(handleCopyInstall),
    ]);

  /* ── mobile toggle ─────────────────────────────────────────────────── */
  const mobileToggle = Button(mobileOpen ? "Close" : "Menu")
    .variant("raw")
    .className("nv-mobile-btn")
    .style({ fontWeight: 400 })
    .props({ "aria-expanded": mobileOpen, "aria-controls": "nv-drawer" })
    .onPress(() => setMobileOpen((prev) => !prev));

  /* ── top bar ───────────────────────────────────────────────────────── */
  const inner = Row()
    .className("nv-inner")
    .mainAxisAlignment("spaceBetween")
    .crossAxisAlignment("center")
    .children([brand, links, actions, mobileToggle]);

  /* ── mobile drawer ─────────────────────────────────────────────────── */
  const drawer = mobileOpen
    ? Column()
        .id("nv-drawer")
        .className("nv-drawer")
        .crossAxisAlignment("stretch")
        .props({ role: "navigation", "aria-label": "Mobile navigation" })
        .children([
          <a key="architecture" href="/#architecture" onClick={closeMobile}>
            Our Architecture
          </a>,
          <a key="workbench" href="/#workbench" onClick={closeMobile}>
            100K Live Workbench
          </a>,
          <a key="ecosystem" href="/#ecosystem" onClick={closeMobile}>
            Inter-Grid Registry Bus
          </a>,
          <Link key="docs" href="/docs" onClick={closeMobile}>
            Documentation Manual (33 Chapters)
          </Link>,
          Button(
            copied ? "Copied: npm install fibogrid" : "Copy: npm install fibogrid",
          )
            .key("copy")
            .variant("raw")
            .style({ fontWeight: 400, justifyContent: "flex-start" })
            .onPress(() => {
              handleCopyInstall();
              closeMobile();
            }),
        ])
    : null;

  /* `Header` is `display:flex; items-center` (row) — wrap in a stretch
     Column so the drawer stacks beneath the bar instead of beside it. */
  return Header()
    .className("nv-nav")
    .style({ height: "auto", minHeight: 0, padding: 0 })
    .children([
      Column()
        .key("nav-shell")
        .crossAxisAlignment("stretch")
        .children(drawer ? [inner, drawer] : [inner]),
    ])
    .build();
}
