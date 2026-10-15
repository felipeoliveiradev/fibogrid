"use client";

import { useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useT } from "@/lib/i18n/locale-context";
import { highlightCode } from "./highlight";

type CodeBlockProps = {
  code: string;
  language?: string;
  label?: string;
};

function normalizeLang(raw?: string): string {
  if (!raw) return "text";
  const lang = raw.toLowerCase();
  if (lang === "typescript" || lang === "ts") return "ts";
  if (lang === "javascript" || lang === "js") return "js";
  if (lang === "shell" || lang === "console") return "bash";
  return lang;
}

function displayLang(lang: string, docs: Dictionary["docs"]): string {
  const map: Record<string, string> = {
    ts: docs.langTypescript,
    tsx: docs.langTsx,
    js: docs.langJavascript,
    jsx: docs.langJsx,
    bash: docs.langTerminal,
    sh: docs.langTerminal,
    json: docs.langJson,
    css: docs.langCss,
    html: docs.langHtml,
    text: docs.langPlain,
    tree: docs.structure,
    result: docs.result,
    output: docs.output,
  };
  return map[lang] ?? lang.toUpperCase();
}

export function isTreeBlock(code: string, language?: string): boolean {
  const lang = normalizeLang(language);
  if (lang === "tree" || lang === "text" || lang === "plaintext") {
    return /├──|└──|│/.test(code);
  }
  return !language && /├──|└──/.test(code);
}

export function shouldAttachLiveGrid(code: string, language?: string): boolean {
  const lang = normalizeLang(language);
  if (!["ts", "tsx", "js", "jsx"].includes(lang)) return false;
  if (!/\bFiboGrid\b/.test(code)) return false;
  if (/ServerSideDataSource|useGridRegistry|GridRegistryProvider/.test(code)) {
    return false;
  }
  return /rowData\s*=/.test(code) && /columnDefs\s*=/.test(code);
}

export function CodeBlock({ code, language, label }: CodeBlockProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const lang = isTreeBlock(code, language) ? "tree" : normalizeLang(language);
  const title = label ?? displayLang(lang, t.docs);
  const html = useMemo(() => highlightCode(code, lang), [code, lang]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`dc-code ${lang === "tree" ? "is-tree" : ""}`} data-lang={lang}>
      <div className="dc-code-bar">
        <div className="dc-code-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="dc-code-lang">{title}</span>
        <button type="button" className="dc-code-copy" onClick={onCopy}>
          {copied ? t.docs.copied : t.docs.copy}
        </button>
      </div>
      <pre className="dc-code-pre hljs">
        <code
          className={`language-${lang} hljs`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}
