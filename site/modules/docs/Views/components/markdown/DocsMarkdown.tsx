"use client";

import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useT } from "@/lib/i18n/locale-context";
import {
  CodeBlock,
  isTreeBlock,
  shouldAttachLiveGrid,
} from "./CodeBlock";
import { DocsLiveGrid } from "./DocsLiveGrid";
import { ResultFrame } from "./ResultFrame";

type DocsMarkdownProps = {
  content: string;
};

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const el = node as { props?: { children?: ReactNode } };
    return extractText(el.props?.children);
  }
  return "";
}

export function DocsMarkdown({ content }: DocsMarkdownProps) {
  const t = useT();

  const components: Components = {
    pre({ children }) {
      return <>{children}</>;
    },
    code({ className, children, ...props }) {
      const text = extractText(children).replace(/\n$/, "");
      const match = /language-([\w-]+)/.exec(className ?? "");
      const language = match?.[1];
      const inline =
        !className &&
        !text.includes("\n") &&
        !("data-language" in (props as Record<string, unknown>));

      if (inline) {
        return (
          <code className="dc-inline-code" {...props}>
            {children}
          </code>
        );
      }

      const lang = language?.toLowerCase();
      const isOutput = lang === "result" || lang === "output" || lang === "console";

      if (isOutput) {
        return (
          <div className="dc-example">
            <ResultFrame title={t.docs.result} variant="output">
              <pre className="dc-result-pre">
                <code>{text}</code>
              </pre>
            </ResultFrame>
          </div>
        );
      }

      const tree = isTreeBlock(text, language);
      const live = shouldAttachLiveGrid(text, language);

      return (
        <div className={`dc-example${live ? " dc-example--pair" : ""}`}>
          <CodeBlock
            code={text}
            language={tree ? "tree" : language}
            label={tree ? t.docs.structure : undefined}
          />
          {live ? (
            <ResultFrame title={t.docs.result} variant="live">
              <DocsLiveGrid />
            </ResultFrame>
          ) : null}
        </div>
      );
    },
    table({ children }) {
      return (
        <div className="dc-table-wrap">
          <table>{children}</table>
        </div>
      );
    },
    a({ href, children }) {
      const external = href?.startsWith("http");
      return (
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="dc-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
