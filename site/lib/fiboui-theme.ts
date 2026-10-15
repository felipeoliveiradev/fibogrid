/**
 * Site theme is fiboui preset `noir` (CSS class + tokens in the package).
 * Prefer `Column().theme("noir")` / `FiboThemeProvider({ theme: "noir" })`.
 * Layout still stamps `fibo-theme-noir` on <html> for SSR before hydration.
 */
export const FIBOUI_SITE_THEME = "noir" as const;
