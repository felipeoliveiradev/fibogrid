/**
 * FiboUI 2.2+ fluent helpers.
 *
 * `.responsive({ mobile, tablet, desktop })` compiles to CSS `@media`
 * (hydrate-safe, no resize JS). Tiers: mobile <768, tablet 768–1023, desktop ≥1024.
 *
 * Prefer `.md()` / `.lg()` for Tailwind-style min-width when a single tier is enough.
 * Mount `<FiboStyles />` after the app tree (see FiboProviders) so SSR emits rules.
 */
import type { CSSProperties } from "react";
import type { ResponsiveStyles } from "fiboui";

/** Hide below desktop (hamburger nav links/actions). */
export const showDesktopOnly: {
  style: CSSProperties;
  responsive: ResponsiveStyles;
} = {
  style: { display: "none" },
  responsive: {
    mobile: { display: "none" },
    tablet: { display: "none" },
    desktop: { display: "flex" },
  },
};

/** Show only below desktop (Menu button). */
export const showBelowDesktop: {
  style: CSSProperties;
  responsive: ResponsiveStyles;
} = {
  style: { display: "none" },
  responsive: {
    mobile: { display: "flex" },
    tablet: { display: "flex" },
    desktop: { display: "none" },
  },
};

/** Sticky nav — blur only on desktop. */
export const navChromeResponsive: ResponsiveStyles = {
  desktop: {
    background: "rgba(10, 10, 11, 0.88)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
};

export const navInnerResponsive: ResponsiveStyles = {
  mobile: {
    gridTemplateColumns: "1fr auto",
    minHeight: 56,
    paddingBlock: 10,
    paddingInline: 14,
  },
  tablet: {
    gridTemplateColumns: "1fr auto",
    minHeight: 56,
    paddingBlock: 10,
  },
};

export const navInnerDocsResponsive: ResponsiveStyles = {
  mobile: {
    gridTemplateColumns: "1fr auto",
    minHeight: 56,
    paddingBlock: 10,
    paddingInline: 14,
  },
  tablet: {
    gridTemplateColumns: "1fr auto",
    minHeight: 56,
    paddingBlock: 10,
  },
  desktop: {
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    minHeight: 60,
    columnGap: 20,
  },
};

export const heroGridResponsive: ResponsiveStyles = {
  mobile: { gridTemplateColumns: "minmax(0, 1fr)" },
  tablet: { gridTemplateColumns: "minmax(0, 1fr)" },
  desktop: {
    gridTemplateColumns: "minmax(0, 1.18fr) minmax(0, 0.82fr)",
  },
};

export const cards3Responsive: ResponsiveStyles = {
  mobile: { gridTemplateColumns: "minmax(0, 1fr)" },
  tablet: { gridTemplateColumns: "minmax(0, 1fr)" },
  desktop: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
};

export const split2Responsive: ResponsiveStyles = {
  mobile: { gridTemplateColumns: "minmax(0, 1fr)" },
  tablet: { gridTemplateColumns: "minmax(0, 1fr)" },
  desktop: { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" },
};

/** FAQ 2-col → 1-col below ~860px (tablet tier ≈ 768–1023). */
export const faqGridResponsive: ResponsiveStyles = {
  mobile: { gridTemplateColumns: "minmax(0, 1fr)" },
  tablet: { gridTemplateColumns: "minmax(0, 1fr)" },
  desktop: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
};

/** Footer 4-col → 2-col on small screens. */
export const footerGridResponsive: ResponsiveStyles = {
  mobile: { gridTemplateColumns: "1fr 1fr" },
  tablet: { gridTemplateColumns: "1fr 1fr" },
  desktop: { gridTemplateColumns: "1.4fr repeat(3, 1fr)" },
};
