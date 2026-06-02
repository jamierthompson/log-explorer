"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./scroll-to-top.module.css";

/**
 * Floating control that returns the reader to the top of the page.
 * Surfaces once they're well past the hero, and retreats only when it
 * would actually overlap the footer — so on wide viewports it stays in
 * the clear corner gutter, while on narrow ones (full-width footer) it
 * steps aside. Visibility is driven by IntersectionObservers rather than
 * a scroll handler, so there's no layout read on every frame.
 */
export function ScrollToTop() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [pastTop, setPastTop] = useState(false);
  const [overlapsFooter, setOverlapsFooter] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => setPastTop(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    const footer = document.querySelector("footer");
    if (!button || !footer) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setOverlapsFooter(false);
          return;
        }
        const b = button.getBoundingClientRect();
        const f = entry.boundingClientRect;
        setOverlapsFooter(
          !(
            b.right < f.left ||
            b.left > f.right ||
            b.bottom < f.top ||
            b.top > f.bottom
          ),
        );
      },
      // Fine thresholds so the overlap check updates as the footer
      // scrolls through, not only when it enters or leaves.
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const visible = pastTop && !overlapsFooter;

  const handleClick = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        data-visible={visible || undefined}
        aria-label="Scroll to top"
        inert={!visible}
        onClick={handleClick}
      >
        <span className={styles.arrow} aria-hidden="true">
          ↑
        </span>
      </button>
    </>
  );
}
