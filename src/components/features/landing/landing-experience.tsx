"use client";

import type { FilterState } from "@/lib/filter-state";
import type { LogLine } from "@/types/log";

import { Hero } from "./hero";
import styles from "./landing-experience.module.css";
import { Story } from "./story";
import { useHashRoute } from "./use-hash-route";

/**
 * Client shell for the landing experience. Owns hash routing and swaps
 * between the hero and story base views; the skip-link target lives here
 * so it follows whichever view is mounted.
 */
export function LandingExperience({
  lines,
  initialFilter,
}: {
  lines: readonly LogLine[];
  initialFilter?: FilterState;
}) {
  const { view, navigate } = useHashRoute();

  return (
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
  );
}
