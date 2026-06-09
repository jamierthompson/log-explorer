"use client";

import type { LogLine } from "@/demo";

import { Experience } from "@/site/features/experience/experience";
import { Hero } from "@/site/features/hero/hero";
import { SiteNav } from "@/site/features/site-nav/site-nav";
import { Story } from "@/site/features/story/story";
import { Footer } from "@/site/shell/footer/footer";
import { ScrollToTop } from "@/site/shell/scroll-to-top/scroll-to-top";

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
      <main id="main-content" tabIndex={-1} className={styles.main}>
        {view === "demo" ? (
          <div className={styles.demoView}>
            <div className={styles.demoInner}>
              <Experience lines={lines} />
            </div>
          </div>
        ) : view === "story" ? (
          <Story onOpenDemo={() => navigate("demo")} />
        ) : (
          <Hero
            onOpenDemo={() => navigate("demo")}
            onStory={() => navigate("story")}
          />
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
    </>
  );
}
