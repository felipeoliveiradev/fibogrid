import { Canvas, Circle, Path, Rect } from "fiboui";
import type { ArchitectureIconKind } from "../../../Models";

const STROKE = "currentColor";

const line = (d: string) =>
  Path().d(d).fill("none").stroke(STROKE).strokeWidth(1.6).build();

const outlineRect = (x: number, y: number, w: number, h: number, r: number) =>
  Rect()
    .position(x, y)
    .size(w, h)
    .cornerRadius(r)
    .fill("none")
    .stroke(STROKE)
    .strokeWidth(1.6)
    .build();

const outlineCircle = (cx: number, cy: number, r: number) =>
  Circle().center(cx, cy).radius(r).fill("none").stroke(STROKE).strokeWidth(1.6).build();

export function architectureIcon(kind: ArchitectureIconKind) {
  const shapes = (() => {
    switch (kind) {
      case "virtual":
        return [outlineRect(3, 5, 18, 14, 3), line("M3 10h18M9 15h6")];
      case "manager":
        return [outlineCircle(12, 12, 8), line("M12 8l3.5 6h-7L12 8z")];
      case "registry":
        return [
          outlineRect(4, 6, 16, 12, 3),
          outlineCircle(9, 12, 1.5),
          outlineCircle(15, 12, 1.5),
          line("M10.5 12h3"),
        ];
      case "fibo":
        return [line("M4 20h16V4H4v16zM14 4v16M14 14h6")];
      case "group":
        return [line("M4 6h16M7 12h13M10 18h10")];
      default:
        return [
          outlineRect(4, 4, 7, 7, 1.5),
          outlineRect(13, 4, 7, 7, 1.5),
          outlineRect(4, 13, 7, 7, 1.5),
          outlineRect(13, 13, 7, 7, 1.5),
        ];
    }
  })();
  return Canvas().key("svg").size(20, 20).viewBox("0 0 24 24").children(shapes);
}
