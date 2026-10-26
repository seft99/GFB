"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Ordered list that plays its CSS entrance once, when it scrolls into view. It renders
 * visible on the server; only a list that starts below the fold is switched to
 * `data-reveal="pending"` and then to `"in"`, so content never depends on JavaScript.
 * Nothing happens under reduced motion.
 */
export function RevealList({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);

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
      { threshold: 0.3 }
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={ref} className={className}>
      {children}
    </ol>
  );
}
