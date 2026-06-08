"use client";

import { LogExplorer, type FilterState, type LogLine } from "@/demo";

import { Hero } from "@/site/features/hero/hero";
import { Story } from "@/site/features/story/story";
import { DemoStage } from "@/site/shell/demo-stage/demo-stage";
import { Footer } from "@/site/shell/footer/footer";
import { ScrollToTop } from "@/site/shell/scroll-to-top/scroll-to-top";
import { TopNav } from "@/site/shell/top-nav/top-nav";

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
        showStoryLink={view !== "story"}
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
      <DemoStage
        open={demoOpen}
        onOpenChange={(open) => {
          if (!open) exitDemo();
        }}
      >
        <LogExplorer lines={lines} initialFilter={initialFilter} />
      </DemoStage>
    </>
  );
}
