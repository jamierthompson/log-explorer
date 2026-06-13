"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

import { Footer } from "@/site/shell/footer/footer";
import { SiteNav } from "@/site/shell/site-nav/site-nav";
import { scrollAppViewportToTop } from "@/site/ui/scroll-area/app-scroll";
import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import styles from "./site-shell.module.css";

/**
 * The persistent frame around every route: the nav and the single page
 * scroller stay mounted while the route content swaps beneath them. The
 * footer belongs to the long-form reading view only, so it surfaces there
 * and scrolls with it.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStory = pathname.startsWith("/story");

  /*
   * Each route enters at its top. The page scrolls inside the app-level
   * viewport, not the window, so a route change resets that scroller and
   * lands focus on the new view's region — keeping keyboard and
   * screen-reader users at the top. Before paint, so the old scroll
   * position never flashes; skipping the first run leaves the initial
   * load's focus and scroll alone.
   */
  const isFirstRender = useRef(true);
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollAppViewportToTop();
    window.scrollTo(0, 0);
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <SiteNav />
      <ScrollArea isPageScroll focusLabel="Page content">
        <main id="main-content" tabIndex={-1} className={styles.main}>
          {children}
        </main>
        {isStory && <Footer />}
      </ScrollArea>
    </>
  );
}
