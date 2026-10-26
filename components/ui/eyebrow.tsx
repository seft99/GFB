import type { ReactNode } from "react";
import { cx } from "@/src/lib/cx";

/** Small uppercase kicker above a heading. `onDark` switches to the lime accent. */
export function Eyebrow({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return <p className={cx("eyebrow", onDark && "eyebrow--lime")}>{children}</p>;
}
