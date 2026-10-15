import { Canvas, Path, Rect, Row, Text } from "fiboui";

const STROKE = "currentColor";

function markShapes() {
  return [
    Rect()
      .position(1.5, 1.5)
      .size(31, 31)
      .cornerRadius(2.5)
      .fill("none")
      .stroke(STROKE)
      .strokeWidth(1.5)
      .build(),
    Path()
      .d("M14.5 1.5v31M1.5 14.5h31")
      .fill("none")
      .stroke(STROKE)
      .strokeWidth(1.5)
      .build(),
    Path()
      .d("M22.5 14.5v18M14.5 22.5h18")
      .fill("none")
      .stroke(STROKE)
      .strokeWidth(1)
      .opacity(0.4)
      .build(),
    Rect()
      .position(16, 3.5)
      .size(14.5, 9.5)
      .cornerRadius(1.25)
      .fill(STROKE)
      .build(),
  ];
}

export function FiboMark(opts?: { size?: number; key?: string }) {
  const size = opts?.size ?? 20;
  return Canvas()
    .key(opts?.key ?? "mark")
    .size(size, size)
    .viewBox("0 0 34 34")
    .props({ role: "img", "aria-label": "FiboGrid" })
    .children(markShapes());
}

export function FiboLogo(opts?: {
  size?: number;
  key?: string;
  showWordmark?: boolean;
}) {
  const size = opts?.size ?? 20;
  const showWordmark = opts?.showWordmark ?? true;
  const mark = FiboMark({ size, key: "glyph" });

  if (!showWordmark) return mark;

  return Row()
    .key(opts?.key ?? "logo")
    .spacing(10)
    .crossAxisAlignment("center")
    .hug()
    .children([
      mark,
      Text("FIBOGRID")
        .key("label")
        .variant("caption")
        .style({
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: 14,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          lineHeight: 1,
          color: "inherit",
        }),
    ]);
}
