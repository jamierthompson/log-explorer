"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./scroll-to-top.module.css";

/**
 * Floating control that returns the reader to the top of the page.
 * Surfaces once they're well past the hero, and retreats only when it
 * would actually overlap the footer — so on wide viewports it stays put
 * in the clear corner gutter, while on narrow ones it steps aside.
 */
export function ScrollToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const pastTop = window.scrollY > window.innerHeight * 0.75;
      let overlapsFooter = false;
      const btn = ref.current;
      const footer = document.querySelector("footer");
      if (pastTop && btn && footer) {
        const b = btn.getBoundingClientRect();
        const f = footer.getBoundingClientRect();
        overlapsFooter = !(
          b.right < f.left ||
          b.left > f.right ||
          b.bottom < f.top ||
          b.top > f.bottom
        );
      }
      setVisible(pastTop && !overlapsFooter);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleClick = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      ref={ref}
      type="button"
      className={styles.button}
      data-visible={visible || undefined}
      aria-label="Scroll to top"
      tabIndex={visible ? 0 : -1}
      onClick={handleClick}
    >
      <span className={styles.arrow} aria-hidden="true">↑</span>
    </button>
  );
}
