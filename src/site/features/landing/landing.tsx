"use client";

import type { LogLine } from "@/demo";

import { Experience } from "@/site/features/experience/experience";
import { Hero } from "@/site/features/hero/hero";
import { SiteNav } from "@/site/shell/site-nav/site-nav";
import { Story } from "@/site/features/story/story";
import { Footer } from "@/site/shell/footer/footer";
import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import styles from "./landing.module.css";
import { useHashRoute } from "./use-hash-route";

/**
 * Client shell for the single-page experience. Owns hash routing and
 * swaps between the hero, demo, and story views beneath one persistent
 * nav (which sits above the skip-link target so "skip to main content"
 * bypasses it).
 */
export function Landing({ lines }: { lines: readonly LogLine[] }) {
  const { view, navigate } = useHashRoute();

  return (
    <>
      <SiteNav view={view} onNavigate={navigate} />
      <ScrollArea isPageScroll focusLabel="Page content">
        <main id="main-content" tabIndex={-1} className={styles.main}>
          {/* The experience stays mounted across view switches, hidden
           * when another view is up, so leaving for the story (or hero)
           * and coming back — by link or browser back — finds the demo
           * exactly where the visitor left it. The hidden attribute also
           * makes the concealed explorer ignore document-level keys. */}
          <div className={styles.demoView} hidden={view !== "demo"}>
            <div className={styles.demoInner}>
              <Experience lines={lines} onReadStory={() => navigate("story")} />
            </div>
          </div>
          {view === "story" ? (
            <Story onOpenDemo={() => navigate("demo")} />
          ) : view === "hero" ? (
            <Hero
              onOpenDemo={() => navigate("demo")}
              onStory={() => navigate("story")}
            />
          ) : null}
        </main>
        {/* The footer belongs to the long-form reading view only, and
         * scrolls with it — its back-to-top control included, surfacing
         * only once the reader reaches the end. */}
        {view === "story" && <Footer />}
      </ScrollArea>
    </>
  );
}
