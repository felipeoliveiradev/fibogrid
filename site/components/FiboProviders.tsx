"use client";

import { FiboStyles, MotionStyles } from "fiboui";

/**
 * Theme is locked via `fibo-theme-noir` on <html> (layout) + `.theme("noir")`
 * on page roots. FiboThemeProvider is optional — noir CSS ships in fiboui.
 *
 * FiboStyles / MotionStyles as later siblings so SSR collects media, pseudo,
 * and motion preset CSS after the tree registers rules.
 */
export function FiboProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FiboStyles />
      <MotionStyles />
    </>
  );
}
