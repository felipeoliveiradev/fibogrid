import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import "fiboui/style.css";
import "./globals.css";
import { FiboProviders } from "@/components/FiboProviders";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-loaded",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fibogrid.dev"),
  title: {
    default: "FIBOGRID — The Digital Frontier of React Data Grids",
    template: "%s · FIBOGRID",
  },
  description:
    "High-density virtualised React 18/19 data grid proportioned on the Fibonacci sequence (φ = 1.618). Dual-axis DOM windowing, transactional gridApi.manager(), and inter-grid event bus.",
  keywords: [
    "FiboGrid",
    "React Data Grid",
    "React 19 Data Table",
    "Virtualised Grid",
    "TypeScript DataGrid",
    "Golden Ratio Grid System",
  ],
  authors: [{ name: "Felipe Oliveira", url: "https://github.com/felipeoliveiradev" }],
  openGraph: {
    title: "FIBOGRID — The Digital Frontier of React Data Grids",
    description:
      "High-density virtualised React 18/19 data grid proportioned on the Fibonacci sequence (φ = 1.618). 100k+ rows, transactional mutations, and inter-grid registry.",
    url: "https://fibogrid.dev",
    siteName: "FIBOGRID",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIBOGRID — The Digital Frontier of React Data Grids",
    description:
      "High-density virtualised React 18/19 data grid proportioned on the Fibonacci sequence (φ = 1.618).",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

/** Minimal SSR seed — full noir tokens live in fiboui `themes/noir.css`. */
const NOIR_HTML_STYLE = {
  colorScheme: "dark",
  backgroundColor: "#0A0A0B",
  ["--fibo-font-family" as string]:
    "var(--font-sans-loaded), var(--font-sans), system-ui, sans-serif",
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark fibo-theme-noir ${jakarta.variable} ${jetbrainsMono.variable}`}
      style={NOIR_HTML_STYLE}
    >
      <body style={{ backgroundColor: "#0A0A0B", color: "#F4F4F6" }}>
        <FiboProviders>{children}</FiboProviders>
      </body>
    </html>
  );
}
