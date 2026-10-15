"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/locale-context";

type ResultFrameProps = {
  title?: string;
  children: ReactNode;
  variant?: "live" | "output";
};

export function ResultFrame({
  title,
  children,
  variant = "live",
}: ResultFrameProps) {
  const t = useT();
  const heading = title ?? t.docs.result;

  return (
    <div className={`dc-result dc-result--${variant}`}>
      <div className="dc-result-bar">
        <span className="dc-result-title">{heading}</span>
        {variant === "live" ? (
          <span className="dc-result-live">
            <span className="dc-result-live-dot" aria-hidden="true" />
            {t.docs.live}
          </span>
        ) : (
          <span className="dc-result-meta">{t.docs.output}</span>
        )}
      </div>
      <div className="dc-result-body">{children}</div>
    </div>
  );
}
