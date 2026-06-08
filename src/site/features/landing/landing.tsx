"use client";

import type { FilterState, LogLine } from "@/demo";

import { DemoOverlay } from "@/site/features/demo-overlay/demo-overlay";
import { Footer } from "@/site/features/footer/footer";
import { Hero } from "@/site/features/hero/hero";
import { ScrollToTop } from "@/site/features/scroll-to-top/scroll-to-top";
import { Story } from "@/site/features/story/story";
import { TopNav } from "@/site/features/top-nav/top-nav";

import styles from "./landing.module.css";
import { useHashRoute } from "./use-hash-route";

/**
 * Client shell for the landing experience. Owns hash routing, swaps
 * between the hero and story base views, and layers the demo overlay on
 * top. The nav sits above the skip-link target so "skip to main content"
 * bypasses it.
 */
export function Landing({
  lines,
  initialFilter,
}: {
  lines: readonly LogLine[];
  initialFilter?: FilterState;
}) {
  const { view, demoOpen, navigate, openDemo, exitDemo } = useHashRoute();

  return (
    <>
      <TopNav
        view={view}
        onHome={() => navigate("hero")}
        onStory={() => navigate("story")}
      />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        {view === "story" ? (
          <Story onOpenDemo={openDemo} />
        ) : (
          <Hero onOpenDemo={openDemo} onStory={() => navigate("story")} />
        )}
      </main>
      {/* Footer and scroll-to-top belong to the long-form reading view
       * only. */}
      {view === "story" && (
        <>
          <Footer />
          <ScrollToTop />
        </>
      )}
      <DemoOverlay
        open={demoOpen}
        onOpenChange={(open) => {
          if (!open) exitDemo();
        }}
        lines={lines}
        initialFilter={initialFilter}
      />
    </>
  );
}
