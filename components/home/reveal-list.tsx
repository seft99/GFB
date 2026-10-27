"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealListProps = {
  as?: "ol" | "ul" | "div";
  className?: string;
  /** Id of a visible label for the list (`aria-labelledby`). */
  labelledBy?: string;
  children: ReactNode;
};

/**
 * Element (an ordered list by default) that plays its CSS entrance once, when it scrolls
 * into view. It renders
 * visible on the server; only a list that starts below the fold is switched to
 * `data-reveal="pending"` and then to `"in"`, so content never depends on JavaScript.
 * It reveals as soon as its top edge is a little inside the viewport (not when a share of
 * a tall block is visible), so scrolling never passes a blank area. Nothing happens under
 * reduced motion.
 */
export function RevealList({ as = "ol", className, labelledBy, children }: RevealListProps) {
  // One ref type that fits every allowed tag.
  const ref = useRef<HTMLOListElement & HTMLUListElement & HTMLDivElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (list.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    list.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        list.dataset.reveal = "in";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag ref={ref} className={className} aria-labelledby={labelledBy}>
      {children}
    </Tag>
  );
}
