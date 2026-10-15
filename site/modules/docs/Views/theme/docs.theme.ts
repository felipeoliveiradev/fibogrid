import type { CSSProperties } from "react";

export const DOCS = {
  accent: "#E4E4E7",
  frame: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--ink)",
  } satisfies CSSProperties,

  shell: {
    maxWidth: 1180,
    marginInline: "auto",
    padding: "32px clamp(20px, 4vw, 40px) 120px",
    boxSizing: "border-box",
    width: "100%",
  } satisfies CSSProperties,

  grid: {
    display: "grid",
    gridTemplateColumns: "240px minmax(0, 1fr)",
    gap: "clamp(36px, 5vw, 72px)",
    alignItems: "start",
  } satisfies CSSProperties,

  aside: {
    position: "sticky",
    top: 84,
    minWidth: 0,
    maxHeight: "calc(100vh - 100px)",
    overflowY: "auto",
    paddingRight: 8,
    paddingBottom: 32,
    scrollbarWidth: "thin",
  } satisfies CSSProperties,

  asideLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--ink-4)",
    margin: "28px 0 8px 10px",
  } satisfies CSSProperties,

  asideLabelFirst: {
    marginTop: 18,
  } satisfies CSSProperties,

  navHome: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.35,
    textAlign: "left",
    color: "var(--ink-2)",
    background: "transparent",
    border: "none",
    boxShadow: "none",
    cursor: "pointer",
    height: "auto",
    minHeight: 0,
    marginBottom: 4,
  } satisfies CSSProperties,

  navLink: {
    display: "block",
    width: "100%",
    padding: "7px 10px",
    borderRadius: 8,
    borderLeft: "2px solid transparent",
    fontSize: 13.5,
    fontWeight: 400,
    lineHeight: 1.4,
    textAlign: "left",
    color: "var(--ink-3)",
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    boxShadow: "none",
    cursor: "pointer",
    height: "auto",
    minHeight: 0,
  } satisfies CSSProperties,

  navLinkActive: {
    color: "var(--ink)",
    background: "rgba(255,255,255,0.05)",
    borderLeftColor: "#F4F4F6",
    fontWeight: 500,
  } satisfies CSSProperties,

  callout: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "18px 20px",
    marginBottom: 36,
    borderRadius: 14,
    border: "1px solid var(--border-mid)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
  } satisfies CSSProperties,

  calloutTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--ink)",
  } satisfies CSSProperties,

  calloutBody: {
    fontSize: 13.5,
    lineHeight: 1.55,
    color: "var(--ink-2)",
  } satisfies CSSProperties,

  calloutCode: {
    fontFamily: "var(--font-mono-loaded), ui-monospace, monospace",
    fontSize: 13,
    color: "var(--ink)",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: "10px 12px",
    marginTop: 4,
  } satisfies CSSProperties,

  article: {
    minWidth: 0,
    maxWidth: 720,
    width: "100%",
  } satisfies CSSProperties,

  kicker: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--ink-3)",
    marginBottom: 10,
  } satisfies CSSProperties,

  heroTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 400,
    fontSize: "clamp(32px, 3.8vw, 44px)",
    letterSpacing: "-0.025em",
    lineHeight: 1.12,
    color: "var(--ink)",
    margin: "0 0 16px",
    textTransform: "none",
  } satisfies CSSProperties,

  heroLead: {
    fontSize: 16.5,
    lineHeight: 1.65,
    color: "var(--ink-2)",
    maxWidth: "48ch",
    margin: "0 0 40px",
  } satisfies CSSProperties,

  sectionHead: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "var(--ink-4)",
    margin: "36px 0 10px",
  } satisfies CSSProperties,

  sectionHeadFirst: {
    marginTop: 8,
  } satisfies CSSProperties,

  chapterRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    width: "100%",
    padding: "14px 0",
    borderRadius: 0,
    border: "none",
    borderBottom: "1px solid var(--border-subtle)",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "none",
    height: "auto",
    minHeight: 0,
  } satisfies CSSProperties,

  chapterTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: "var(--ink)",
    display: "block",
  } satisfies CSSProperties,

  chapterPath: {
    fontSize: 12.5,
    color: "var(--ink-4)",
    display: "block",
    marginTop: 3,
    fontFamily: "var(--font-mono-loaded), ui-monospace, monospace",
  } satisfies CSSProperties,

  chapterGo: {
    fontSize: 18,
    lineHeight: 1,
    color: "var(--ink-4)",
    flexShrink: 0,
  } satisfies CSSProperties,

  pager: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 64,
    paddingTop: 32,
    borderTop: "1px solid var(--border-subtle)",
  } satisfies CSSProperties,

  pagerCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    padding: "18px 18px",
    borderRadius: 12,
    border: "1px solid var(--border-subtle)",
    background: "rgba(255,255,255,0.015)",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "none",
    height: "auto",
    minHeight: 0,
    width: "100%",
  } satisfies CSSProperties,

  pagerHint: {
    fontSize: 12,
    color: "var(--ink-4)",
  } satisfies CSSProperties,

  pagerTitle: {
    fontSize: 14.5,
    fontWeight: 500,
    color: "var(--ink)",
  } satisfies CSSProperties,
} as const;
