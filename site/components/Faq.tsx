"use client";

import { Column, Container, Text } from "fiboui";

interface FaqEntry {
  code: string;
  q: string;
  a: string[];
}

const FAQS: FaqEntry[] = [
  {
    code: "01",
    q: "How does FiboGrid stay responsive across 100,000+ rows?",
    a: [
      "FiboGrid decouples scroll physics from React tree reconciliation. Visible row and column windows are computed in O(1) from prefix-sum offsets, while column-pinning partitions, cell merge maps, and Set-based selection lookups are hoisted out of the per-row render loop.",
    ],
  },
  {
    code: "02",
    q: "Why is the grid proportioned on the Fibonacci sequence (φ = 1.618)?",
    a: [
      "FiboGrid derives its compact row height (21px), canonical row height (34px), comfort cadence (55px), and cell padding (8px / 13px) directly from consecutive Fibonacci numbers so high-density data remains effortless to scan.",
    ],
  },
  {
    code: "03",
    q: "How do programmatic mutations work without re-rendering the parent page?",
    a: [
      "Every instance exposes a typed GridApi via onGridReady or useGridRegistry(). Calling gridApi.manager().upAdd(rows).remove(ids).execute() applies delta transactions inside an internal versioned Map without forcing parent React state re-renders.",
    ],
  },
  {
    code: "04",
    q: "Can multiple FiboGrid instances communicate without Redux boilerplate?",
    a: [
      "Yes. Wrap your layout in <GridRegistryProvider> and assign each grid a gridId. Any component or sibling grid can subscribe to typed lifecycle events via useGridEvents(gridId) or orchestrate sibling grids via useGridRegistry().getGridApi(gridId).",
    ],
  },
];

/*
 * Why native <details> instead of fiboui `Collapse()`:
 * Collapse (fiboui@2.0.0) hard-codes a light theme (bg-white, border-gray-200,
 * hover:bg-gray-50, text-gray-600) on its internal header/body nodes and caps
 * the body at max-height 500px. None of those nodes accept className/style
 * overrides, so it cannot be themed to the noir canvas without editing
 * globals.css. `<details>` keeps native a11y + the existing `fq-*` styling,
 * wrapped in fiboui Column/Container shells.
 */
function faqItem(item: FaqEntry, idx: number) {
  return (
    <details key={item.code} className="fq-item" open={idx < 2}>
      <summary className="fq-q">
        {Text(item.q).type("caption").build()}
        <span className="fq-icon" aria-hidden="true">
          +
        </span>
      </summary>
      {Column()
        .className("fq-a")
        .crossAxisAlignment("stretch")
        .children(
          item.a.map((paragraph, i) =>
            Text(paragraph).key(i).type("body"),
          ),
        )
        .build()}
    </details>
  );
}

export function Faq() {
  return Column()
    .className("fq-section")
    .id("faq")
    .props({ role: "region", "aria-labelledby": "fq-title" })
    .crossAxisAlignment("stretch")
    .children([
      Column()
        .className("noir-wrap")
        .crossAxisAlignment("stretch")
        .children([
          Text("FREQUENTLY ASKED\nQUESTIONS")
            .key("title")
            .type("h2")
            .id("fq-title")
            .className("noir-h2")
            .style({ whiteSpace: "pre-line" }),
          Container()
            .key("grid")
            .className("fq-grid")
            .children(FAQS.map(faqItem)),
        ]),
    ])
    .build();
}
