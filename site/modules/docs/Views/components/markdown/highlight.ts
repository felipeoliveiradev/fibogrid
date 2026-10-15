import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

let registered = false;

function ensureLanguages() {
  if (registered) return;
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("ts", typescript);
  hljs.registerLanguage("tsx", typescript);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("js", javascript);
  hljs.registerLanguage("jsx", javascript);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("sh", bash);
  hljs.registerLanguage("shell", bash);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("html", xml);
  hljs.registerLanguage("xml", xml);
  registered = true;
}

const LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  sh: "bash",
  shell: "bash",
  console: "bash",
  yml: "yaml",
};

export function highlightCode(code: string, language?: string): string {
  ensureLanguages();
  const raw = (language ?? "text").toLowerCase();
  if (raw === "tree" || raw === "text" || raw === "plaintext" || raw === "result" || raw === "output") {
    return escapeHtml(code);
  }

  const lang = LANG_ALIASES[raw] ?? raw;
  try {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    }
    return hljs.highlightAuto(code).value;
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
