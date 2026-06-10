"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { SITE_NAME, SITE_TITLE } from "@/site/lib/site-meta";
import { scrollAppViewportToTop } from "@/site/ui/scroll-area/app-scroll";

/** Every routable view of the single-page experience. */
export type View = "hero" | "demo" | "story";

/*
 * The static head title fits the hero; the other views get their own so
 * history entries and assistive tech can tell the views apart.
 */
const VIEW_TITLES: Record<View, string> = {
  hero: SITE_TITLE,
  demo: `Demo — ${SITE_NAME}`,
  story: `Story — ${SITE_NAME}`,
};

/** Map a URL hash to a view, defaulting to the hero. */
export function viewFromHash(hash: string): View {
  if (hash === "#demo") return "demo";
  if (hash === "#story") return "story";
  return "hero";
}

/*
 * pushState fires neither popstate nor hashchange, so navigations made
 * here announce themselves with this event to keep the store in sync.
 */
const LOCATION_EVENT = "landing:locationchange";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener(LOCATION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener(LOCATION_EVENT, onStoreChange);
  };
}

/**
 * Hash-driven routing for the single-page experience. The view is derived
 * from the URL via useSyncExternalStore, so links, reloads, and
 * back/forward all resolve to the same place; the server snapshot is the
 * hero, avoiding a hydration mismatch.
 */
export function useHashRoute(): {
  view: View;
  navigate: (view: View) => void;
} {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );
  const view = viewFromHash(hash);

  // In an effect for SSR safety; covers deep links, back/forward, and
  // in-app navigation alike since they all resolve through `view`.
  useEffect(() => {
    document.title = VIEW_TITLES[view];
  }, [view]);

  const navigate = useCallback((next: View) => {
    const url =
      next === "hero"
        ? window.location.pathname + window.location.search
        : `#${next}`;
    window.history.pushState({ view: next }, "", url);
    window.dispatchEvent(new Event(LOCATION_EVENT));
    // The page scrolls inside the app-level scroll viewport, not the
    // window, so a new view must reset that scroller to land at its top.
    scrollAppViewportToTop();
    window.scrollTo(0, 0);
    // The control that triggered the switch can unmount with the old
    // view, which would strand focus on the body; landing it on the main
    // region keeps keyboard and screen-reader users at the top of the
    // new view. Only here, on user-initiated navigation — the initial
    // load must not grab focus.
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, []);

  return { view, navigate };
}
