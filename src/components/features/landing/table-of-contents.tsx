"use client";

import { Button } from "@/components/ui/button/button";

import { STORY_SECTIONS } from "./story-sections";
import styles from "./table-of-contents.module.css";

/**
 * Jump-to-section list for the story. The entries are buttons, not
 * anchors: an <a href="#id"> would change the URL hash and be picked up
 * by the route parser, so the scroll is driven imperatively instead. The
 * sections' scroll-margin clears the sticky nav; the jump honors
 * prefers-reduced-motion.
 */
export function TableOfContents() {
  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav className={styles.toc} aria-label="On this page">
      <ul className={styles.list}>
        {STORY_SECTIONS.map((section) => (
          <li key={section.id}>
            <Button
              variant="quiet"
              className={styles.link}
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
