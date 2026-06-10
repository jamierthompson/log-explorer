"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Every routable view of the single-page experience. */
export type View = "hero" | "demo" | "story";

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

  const navigate = useCallback((next: View) => {
    const url =
      next === "hero"
        ? window.location.pathname + window.location.search
        : `#${next}`;
    window.history.pushState({ view: next }, "", url);
    window.dispatchEvent(new Event(LOCATION_EVENT));
    // The page scrolls inside the app-level scroll viewport, not the
    // window, so a new view must reset that scroller to land at its top.
    const viewport = document.querySelector("[data-app-scroll-viewport]");
    if (viewport) viewport.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  return { view, navigate };
}
