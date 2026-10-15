/**
 * Landing motion presets — fiboui 2.2 CSS path (no rAF).
 * Scroll: `.onScroll()` / `.reveal()` → IntersectionObserver + `.fibo-inview`
 * Enter: `.animate('fadeIn'|'slideUp'|…).duration().ease()`
 * Lists: parent `.stagger(ms)` sets `--fibo-stagger`; children get `--fibo-i`
 */

/** Section chrome entering the viewport */
export const SCROLL_SECTION = "fadeUp" as const;

/** Cards / stacked items */
export const SCROLL_CARD = "fadeUp" as const;

/** Soft scale for media frames */
export const SCROLL_SCALE = "scaleIn" as const;

export const DUR = {
  hero: 640,
  section: 560,
  card: 480,
  micro: 280,
} as const;

export const STAGGER = {
  pills: 70,
  cards: 90,
  faq: 70,
  footer: 60,
} as const;
