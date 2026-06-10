"use client";

import { useEffect, useRef, useState } from "react";

import { getAppScrollViewport } from "@/site/ui/scroll-area/app-scroll";

import styles from "./scroll-to-top.module.css";

/**
 * Floating control that returns the reader to the top of the page.
 * Surfaces once they're well past the hero, and retreats only when it
 * would actually overlap the footer — so on wide viewports it stays in
 * the clear corner gutter, while on narrow ones (full-width footer) it
 * steps aside. The shared scroll container owns scrolling, so visibility
 * tracks its scroll position (and the footer's place within it).
 */
export function ScrollToTop() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pastTop, setPastTop] = useState(false);
  const [overlapsFooter, setOverlapsFooter] = useState(false);

  useEffect(() => {
    const scroller = getAppScrollViewport();
    if (!scroller) return;
    const update = () =>
      setPastTop(scroller.scrollTop > window.innerHeight * 0.75);
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const scroller = getAppScrollViewport();
    const button = buttonRef.current;
    const footer = document.querySelector("footer");
    if (!scroller || !button || !footer) return;
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
      // Observe within the scroll container, with fine thresholds so the
      // overlap check updates as the footer scrolls through.
      {
        root: scroller,
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const visible = pastTop && !overlapsFooter;

  const handleClick = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    (getAppScrollViewport() ?? window).scrollTo({
      top: 0,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
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
  );
}
