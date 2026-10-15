"use client";

import type { CSSProperties } from "react";
import { Button, Column } from "fiboui";

export { goHash, openExternal, open } from "fiboui";

export const NOIR_TEXT = {
  h1: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(38px, 4.4vw, 60px)",
    fontWeight: 300,
    lineHeight: 1.12,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    color: "var(--ink)",
  } satisfies CSSProperties,
  h2: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(28px, 3.2vw, 44px)",
    fontWeight: 300,
    lineHeight: 1.18,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    color: "var(--ink)",
  } satisfies CSSProperties,
  copy: {
    fontSize: 13.5,
    lineHeight: 1.7,
    color: "var(--ink-2)",
    fontWeight: 400,
  } satisfies CSSProperties,
  cardTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 500,
    letterSpacing: "0.01em",
    color: "var(--ink)",
    maxWidth: "100%",
    overflowWrap: "anywhere",
  } satisfies CSSProperties,
  cardDesc: {
    fontSize: 13,
    lineHeight: 1.68,
    color: "var(--ink-3)",
    maxWidth: "28ch",
    width: "100%",
    flex: 1,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  } satisfies CSSProperties,
  quote: {
    fontSize: 13.5,
    lineHeight: 1.65,
    color: "var(--ink-2)",
  } satisfies CSSProperties,
  author: {
    fontSize: 13.5,
    fontWeight: 500,
    color: "var(--ink)",
  } satisfies CSSProperties,
  inherit: {
    fontSize: "inherit",
    color: "inherit",
    letterSpacing: "inherit",
  } satisfies CSSProperties,
  lbmNum: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    color: "var(--ink-3)",
    letterSpacing: "normal",
  } satisfies CSSProperties,
  lbmName: {
    fontSize: 13.5,
    fontWeight: 500,
    color: "var(--ink)",
    letterSpacing: "normal",
  } satisfies CSSProperties,
  lbmDesc: {
    fontSize: 12,
    color: "var(--ink-3)",
    letterSpacing: "normal",
  } satisfies CSSProperties,
  lbmTag: {
    fontFamily: "var(--font-sans)",
    fontSize: 10.5,
    color: "var(--ink-3)",
    letterSpacing: "normal",
  } satisfies CSSProperties,
} as const;

export const NOIR = {
  wrap: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: 1320,
    marginInline: "auto",
    paddingInline: "clamp(24px, 4vw, 56px)",
    minWidth: 0,
  } satisfies CSSProperties,

  sectionPad: {
    paddingBlock: "clamp(64px, 8vw, 112px)",
  } satisfies CSSProperties,

  heroSection: {
    position: "relative",
    paddingTop: "clamp(44px, 6vw, 84px)",
    paddingBottom: "clamp(72px, 9vw, 128px)",
    overflow: "hidden",
  } satisfies CSSProperties,

  heroGlow: {
    position: "absolute",
    top: -120,
    left: "8%",
    width: 540,
    height: 540,
    background:
      "radial-gradient(circle, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 45%, transparent 72%)",
    pointerEvents: "none",
  } satisfies CSSProperties,

  heroCopy: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "clamp(18px, 2.4vw, 28px)",
    minWidth: 0,
  } satisfies CSSProperties,

  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  } satisfies CSSProperties,

  actionsRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 22,
    marginTop: 6,
  } satisfies CSSProperties,

  btnRect: {
    padding: "11px 24px",
    borderRadius: 6,
    background: "#232329",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.03em",
    color: "var(--ink)",
    cursor: "pointer",
  } satisfies CSSProperties,

  btnPlay: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontSize: 12.5,
    fontWeight: 400,
    color: "var(--ink-2)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  } satisfies CSSProperties,

  playIcon: {
    width: 26,
    height: 26,
    borderRadius: 999,
    border: "1px solid rgba(255, 255, 255, 0.25)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 9,
    color: "var(--ink)",
  } satisfies CSSProperties,

  sectionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 42,
    width: "100%",
  } satisfies CSSProperties,

  circleNav: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  } satisfies CSSProperties,

  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    background: "var(--card)",
    border: "1px solid var(--border-subtle)",
    color: "var(--ink-2)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
  } satisfies CSSProperties,

  serviceCard: {
    background: "var(--card)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--r-md)",
    padding: "44px 32px 38px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    minWidth: 0,
    maxWidth: "100%",
    height: "100%",
    overflow: "hidden",
  } satisfies CSSProperties,

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    background: "var(--card-inner)",
    border: "1px solid rgba(255, 255, 255, 0.09)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
    color: "var(--ink)",
  } satisfies CSSProperties,

  serviceLink: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--ink-2)",
    letterSpacing: "0.02em",
    paddingBottom: 2,
    borderBottom: "1px solid transparent",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  } satisfies CSSProperties,

  voicesSection: {
    position: "relative",
    paddingBlock: "clamp(72px, 9vw, 132px)",
    overflow: "hidden",
  } satisfies CSSProperties,

  voicesCurve: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    opacity: 0.35,
  } satisfies CSSProperties,

  voicesDivider: {
    width: "100%",
    maxWidth: 420,
    height: 1,
    background: "rgba(255, 255, 255, 0.16)",
    marginBlock: 26,
  } satisfies CSSProperties,

  voicesStack: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  } satisfies CSSProperties,

  voiceCard: {
    backgroundColor: "var(--card)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border-subtle)",
    borderRadius: "var(--r-md)",
    padding: "24px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    cursor: "pointer",
  } satisfies CSSProperties,

  voiceBody: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  } satisfies CSSProperties,

  voiceAvatar: {
    width: 54,
    height: 54,
    borderRadius: 999,
    background: "linear-gradient(145deg, #24242C 0%, #151519 100%)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--ink)",
  } satisfies CSSProperties,

  faqSection: {
    paddingBlock: "clamp(56px, 7vw, 100px)",
    borderTop: "1px solid var(--border-subtle)",
  } satisfies CSSProperties,

  faqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
    marginTop: 36,
    width: "100%",
  } satisfies CSSProperties,

  faqItem: {
    background: "var(--card)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--r-md)",
    padding: "20px 24px",
  } satisfies CSSProperties,

  faqItemOpen: {
    borderColor: "var(--border-mid)",
  } satisfies CSSProperties,

  faqQ: {
    width: "100%",
    background: "transparent",
    border: "none",
    padding: 0,
    textAlign: "left",
    whiteSpace: "normal",
    justifyContent: "space-between",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    color: "var(--ink)",
    display: "flex",
    alignItems: "center",
    gap: 16,
  } satisfies CSSProperties,

  faqIcon: {
    width: 26,
    height: 26,
    borderRadius: 999,
    background: "var(--card-inner)",
    border: "1px solid var(--border-subtle)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--ink-2)",
    flexShrink: 0,
  } satisfies CSSProperties,

  faqIconOpen: {
    background: "var(--ink)",
    color: "var(--bg)",
  } satisfies CSSProperties,

  faqA: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid var(--border-subtle)",
    fontSize: 13,
    lineHeight: 1.68,
    color: "var(--ink-3)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  } satisfies CSSProperties,

  footer: {
    borderTop: "1px solid var(--border-subtle)",
    paddingTop: 64,
    paddingBottom: 48,
    marginTop: 40,
  } satisfies CSSProperties,

  footerGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr repeat(3, 1fr)",
    gap: 40,
    paddingBottom: 48,
    borderBottom: "1px solid var(--border-subtle)",
    width: "100%",
  } satisfies CSSProperties,

  footerColH: {
    fontFamily: "var(--font-display)",
    fontSize: 11.5,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "var(--ink)",
    marginBottom: 16,
  } satisfies CSSProperties,

  footerList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontSize: 13,
    color: "var(--ink-3)",
  } satisfies CSSProperties,

  footerBottom: {
    paddingTop: 28,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    fontSize: 12,
    color: "var(--ink-4)",
    width: "100%",
  } satisfies CSSProperties,

  footerPowered: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 8,
    margin: 0,
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "clamp(13px, 1.4vw, 15px)",
    fontWeight: 500,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--ink)",
    lineHeight: 1.2,
  } satisfies CSSProperties,

  footerPoweredMuted: {
    fontWeight: 400,
    letterSpacing: "0.08em",
    color: "var(--ink-3)",
  } satisfies CSSProperties,

  nav: {
    zIndex: 90,
    width: "100%",
    background: "#0c0c0e",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    padding: 0,
    height: "auto",
    minHeight: 0,
    boxShadow: "none",
    contain: "layout style",
  } satisfies CSSProperties,

  navInner: {
    boxSizing: "border-box",
    maxWidth: 1240,
    width: "100%",
    marginInline: "auto",
    paddingInline: "clamp(16px, 4vw, 64px)",
    paddingBlock: 12,
    minHeight: 64,
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "center",
    columnGap: "clamp(12px, 2vw, 28px)",
  } satisfies CSSProperties,

  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
    whiteSpace: "nowrap",
    fontFamily: "var(--font-display)",
    fontWeight: 400,
    fontSize: 14,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--ink)",
    background: "transparent",
    border: "none",
    padding: 0,
    height: "auto",
    minHeight: 0,
    boxShadow: "none",
    cursor: "pointer",
  } satisfies CSSProperties,

  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    border: "1.5px solid var(--ink)",
    display: "inline-block",
    flexShrink: 0,
  } satisfies CSSProperties,

  brandMark: {
    width: 20,
    height: 20,
    display: "block",
    flexShrink: 0,
    color: "var(--ink)",
  } satisfies CSSProperties,

  navLinks: {
    listStyle: "none",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: "clamp(10px, 1.4vw, 22px)",
    minWidth: 0,
    overflow: "visible",
  } satisfies CSSProperties,

  navLink: {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    lineHeight: 1,
    fontSize: 12.5,
    fontWeight: 400,
    letterSpacing: "0.03em",
    color: "var(--ink-2)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    height: "auto",
    minHeight: 0,
    boxShadow: "none",
  } satisfies CSSProperties,

  navActions: {
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    whiteSpace: "nowrap",
  } satisfies CSSProperties,

  pillBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    minHeight: 32,
    padding: "0 14px",
    borderRadius: "var(--r-pill)",
    border: "1px solid var(--border-mid)",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 11.5,
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: "0.02em",
    color: "var(--ink-2)",
    whiteSpace: "nowrap",
    boxShadow: "none",
    cursor: "pointer",
  } satisfies CSSProperties,

  installBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    minHeight: 32,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid rgba(255, 255, 255, 0.14)",
    background: "#121216",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "0.01em",
    color: "var(--ink)",
    whiteSpace: "nowrap",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
    cursor: "pointer",
  } satisfies CSSProperties,

  installBtnCopied: {
    borderColor: "rgba(52, 211, 153, 0.35)",
    color: "#34d399",
  } satisfies CSSProperties,

  mobileBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    minHeight: 36,
    minWidth: 72,
    padding: "0 14px",
    borderRadius: "var(--r-pill)",
    border: "1px solid var(--border-mid)",
    background: "transparent",
    fontSize: 12,
    color: "var(--ink-2)",
    boxShadow: "none",
    cursor: "pointer",
  } satisfies CSSProperties,

  drawer: {
    padding: "8px clamp(16px, 4vw, 64px) 20px",
    background: "#0c0c0e",
    borderBottom: "1px solid var(--border-mid)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  } satisfies CSSProperties,

  drawerActions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
  } satisfies CSSProperties,

  lbmBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "rgba(0, 0, 0, 0.78)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "10vh 20px 20px",
  } satisfies CSSProperties,

  lbmSheet: {
    width: "100%",
    maxWidth: 680,
    background: "#141418",
    border: "1px solid var(--border-mid)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 32px 90px rgba(0, 0, 0, 0.85)",
  } satisfies CSSProperties,

  lbmBar: {
    padding: "14px 20px",
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    color: "var(--ink-3)",
    width: "100%",
  } satisfies CSSProperties,

  lbmSearchRow: {
    padding: "14px 20px",
    borderBottom: "1px solid var(--border-subtle)",
  } satisfies CSSProperties,

  lbmScroll: {
    maxHeight: "55vh",
    overflowY: "auto",
    padding: 8,
  } satisfies CSSProperties,

  lbmList: {
    listStyle: "none",
  } satisfies CSSProperties,

  lbmRow: {
    display: "grid",
    gridTemplateColumns: "36px 1fr auto",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 10,
    cursor: "pointer",
  } satisfies CSSProperties,
} as const;

export const PILL_STYLE = {
  padding: "5px 18px",
  borderRadius: 999,
  border: "1px solid rgba(255, 255, 255, 0.16)",
  backgroundColor: "rgba(255, 255, 255, 0.015)",
  color: "var(--ink-2)",
  fontSize: 11.5,
} as const;

export const MONO_LABEL_STYLE = {
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  color: "var(--ink-2)",
} as const;

export function sectionColumn(opts: {
  className?: string;
  id?: string;
  labelledBy?: string;
  noReveal?: boolean;
  style?: CSSProperties;
}) {
  const col = Column()
    .className(opts.className ?? "")
    .crossAxisAlignment("stretch")
    .style(opts.style ?? {})
    .props({
      role: "region",
      ...(opts.labelledBy ? { "aria-labelledby": opts.labelledBy } : {}),
    });
  const withMotion = opts.noReveal
    ? col
    : col.onScroll("fadeUp").duration(560).ease("easeOut");
  return opts.id ? withMotion.id(opts.id) : withMotion;
}

export function linkButton(label: string, onPress: () => void, className?: string) {
  return Button(label)
    .variant("raw")
    .className(className ?? "")
    .style({
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontWeight: 400,
      fontSize: "inherit",
      color: "inherit",
      textAlign: "left",
      justifyContent: "flex-start",
      whiteSpace: "normal",
    })
    .hover((h) => {
      h.color("var(--ink)");
    })
    .transition("color", 180, "ease-out")
    .onPress(onPress);
}
