"use client";

import { useCallback } from "react";

import type { FilterState } from "@/lib/filter-state";
import type { LogLine } from "@/types/log";

import { Hero } from "./hero";
import styles from "./landing-experience.module.css";
import { Story } from "./story";
import { TopNav } from "./top-nav";
import { useHashRoute } from "./use-hash-route";

/**
 * Client shell for the landing experience. Owns hash routing and swaps
 * between the hero and story base views. The nav sits above the
 * skip-link target so "skip to main content" bypasses it.
 */
export function LandingExperience({
  lines,
  initialFilter,
}: {
  lines: readonly LogLine[];
  initialFilter?: FilterState;
}) {
  const { view, navigate } = useHashRoute();

  const jumpToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  return (
    <>
      <TopNav
        view={view}
        onHome={() => navigate("hero")}
        onStory={() => navigate("story")}
        onJumpToSection={jumpToSection}
      />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        {view === "story" ? (
          <Story onHome={() => navigate("hero")} />
        ) : (
          <Hero
            lines={lines}
            initialFilter={initialFilter}
            onStory={() => navigate("story")}
          />
        )}
      </main>
    </>
  );
}
