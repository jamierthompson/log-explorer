"use client";

import { useEffect, useState } from "react";

import { Button } from "@/site/ui/button/button";
import { getAppScrollViewport } from "@/site/ui/scroll-area/app-scroll";

import { STORY_SECTIONS } from "./story-sections";
import styles from "./table-of-contents.module.css";

/**
 * Jump-to-section list for the story. The entries are buttons, not
 * anchors: an <a href="#id"> would change the URL hash and be picked up
 * by the route parser, so the scroll is driven imperatively instead. The
 * sections' scroll-margin clears the sticky nav; the jump honors
 * prefers-reduced-motion.
 *
 * The entry for the section under the reader carries aria-current: the
 * last section whose top has passed the reading line near the viewport's
 * top — except at the very end of the scroller, where the final section
 * is the one being read even though it can never climb that high.
 */
export function TableOfContents() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const viewport = getAppScrollViewport();
    if (!viewport) return;

    const computeActive = () => {
      const atEnd =
        viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 4;
      if (atEnd) {
        setActiveId(STORY_SECTIONS[STORY_SECTIONS.length - 1].id);
        return;
      }
      const viewportRect = viewport.getBoundingClientRect();
      const readingLine = viewportRect.top + viewportRect.height * 0.2;
      let current: string | null = null;
      for (const section of STORY_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= readingLine) {
          current = section.id;
        }
      }
      setActiveId(current);
    };

    computeActive();
    viewport.addEventListener("scroll", computeActive, { passive: true });
    window.addEventListener("resize", computeActive);
    return () => {
      viewport.removeEventListener("scroll", computeActive);
      window.removeEventListener("resize", computeActive);
    };
  }, []);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Reflect the choice immediately rather than waiting for the smooth
    // scroll to carry the section into the observed band.
    setActiveId(id);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    // Carry focus to the section so reading continues from the jump
    // target; preventScroll leaves the scroll (smooth or not) to the
    // call above.
    el.focus({ preventScroll: true });
  };

  return (
    <nav className={styles.toc} aria-label="On this page">
      <ul className={styles.list}>
        {STORY_SECTIONS.map((section) => (
          <li key={section.id}>
            <Button
              variant="quiet"
              className={styles.link}
              aria-current={section.id === activeId || undefined}
              onClick={() => jumpTo(section.id)}
            >
              {section.label}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
