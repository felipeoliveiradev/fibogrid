"use client";

import { Box, Button, Column, Component, Container, Text } from "fiboui";
import { faqGridResponsive } from "@/lib/fibo-fluent";
import { useT } from "@/lib/i18n/locale-context";
import { type FaqEntry } from "../../Models";
import { faqOpen, landingVm } from "../../ViewModels/LandingViewModel";
import { NOIR, NOIR_TEXT, sectionColumn } from "../theme";

const faqItem = (item: FaqEntry, index: number) =>
  Box()
    .key(item.code)
    .onScroll("fadeUp")
    .duration(460)
    .delay(index * 70)
    .ease("easeOut")
    .children([
      Box()
        .key("slot")
        .style({ display: "contents" })
        .bindSignal(faqOpen)
        .children(() => {
          const open = faqOpen.value.includes(item.code);
          return [
            Box()
              .key("card")
              .style({
                ...NOIR.faqItem,
                ...(open ? NOIR.faqItemOpen : {}),
                transition: "border-color 220ms ease-out",
              })
              .children([
                Button()
                  .key("q")
                  .clean()
                  .style(NOIR.faqQ)
                  .props({ "aria-expanded": open })
                  .onPress(() => landingVm.toggleFaq(item.code))
                  .children([
                    Text(item.q).key("text").variant("caption").style(NOIR_TEXT.inherit),
                    Container()
                      .key("icon")
                      .style({
                        ...NOIR.faqIcon,
                        ...(open ? NOIR.faqIconOpen : {}),
                      })
                      .props({ "aria-hidden": "true" })
                      .children([open ? "−" : "+"]),
                  ]),
                ...(open
                  ? [
                      Column()
                        .key("a")
                        .style(NOIR.faqA)
                        .crossAxisAlignment("stretch")
                        .children(
                          item.a.map((paragraph, i) =>
                            Text(paragraph)
                              .key(i)
                              .variant("body")
                              .style({
                                fontSize: 13,
                                lineHeight: 1.68,
                                color: "var(--ink-3)",
                              }),
                          ),
                        ),
                    ]
                  : []),
              ]),
          ];
        }),
    ]);

const FaqSectionComponent = () => {
  const t = useT();
  const faqs: FaqEntry[] = t.landing.faqs.map((item) => ({
    code: item.code,
    q: item.q,
    a: [...item.a],
  }));

  return sectionColumn({ id: "faq", labelledBy: "fq-title", style: NOIR.faqSection })
    .children([
      Column()
        .key("wrap")
        .style(NOIR.wrap)
        .crossAxisAlignment("stretch")
        .children([
          Text(t.landing.faqTitle)
            .key("title")
            .variant("h2")
            .id("fq-title")
            .style({ ...NOIR_TEXT.h2, whiteSpace: "pre-line" }),
          Container()
            .key("grid")
            .style(NOIR.faqGrid)
            .responsive(faqGridResponsive)
            .children(faqs.map((item, i) => faqItem(item, i))),
        ]),
    ])
    .build();
};

export const FaqSection = Component()(FaqSectionComponent);
