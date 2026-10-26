"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

const strength = 9;

/**
 * Ordered list that nudges the photo of the hovered `[data-parallax]` item against the
 * mouse by writing `--mx`/`--my` on that item, once per animation frame. No React state
 * changes while the pointer moves; CSS decides whether the variables are used.
 */
export function PointerParallaxList({ className, children }: { className?: string; children: ReactNode }) {
  const frame = useRef(0);
  const active = useRef<HTMLElement | null>(null);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function release() {
    cancelAnimationFrame(frame.current);
    active.current?.style.removeProperty("--mx");
    active.current?.style.removeProperty("--my");
    active.current = null;
  }

  function handleMove(event: PointerEvent<HTMLOListElement>) {
    if (event.pointerType !== "mouse") return;
    const item = (event.target as Element).closest<HTMLElement>("[data-parallax]");
    if (item !== active.current) release();
    if (!item) return;
    active.current = item;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const box = item.getBoundingClientRect();
      item.style.setProperty("--mx", `${((clientX - box.left) / box.width - 0.5) * -strength}px`);
      item.style.setProperty("--my", `${((clientY - box.top) / box.height - 0.5) * -strength}px`);
    });
  }

  return (
    <ol className={className} onPointerMove={handleMove} onPointerLeave={release}>
      {children}
    </ol>
  );
}
