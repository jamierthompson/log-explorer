"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/** The two base pages of the landing experience. */
export type View = "hero" | "story";

/** Every routable location: the base views plus the demo overlay. */
export type Route = View | "demo";

/** Map a URL hash to a route, defaulting to the hero. */
export function routeFromHash(hash: string): Route {
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
 * Hash-driven routing for the landing experience. The route is derived
 * from the URL via useSyncExternalStore, so links, reloads, and
 * back/forward all resolve to the same place; the server snapshot is the
 * hero, avoiding a hydration mismatch.
 *
 * The demo is a full-screen overlay rather than a view of its own, so the
 * base view underneath it is never seen — `view` collapses to the hero
 * while the demo is open. Exiting steps back through history to return to
 * whichever base the demo was opened from.
 */
export function useHashRoute(): {
  view: View;
  demoOpen: boolean;
  navigate: (view: View) => void;
  openDemo: () => void;
  exitDemo: () => void;
} {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );
  const route = routeFromHash(hash);
  const view: View = route === "story" ? "story" : "hero";
  const demoOpen = route === "demo";

  // Whether the demo was opened from within the app (so a history step
  // back lands on its base) versus deep-linked (so there's nowhere to
  // step back to). Touched only in handlers, never during render.
  const openedInApp = useRef(false);

  const navTo = useCallback((next: Route) => {
    const url =
      next === "hero"
        ? window.location.pathname + window.location.search
        : `#${next}`;
    window.history.pushState({ route: next }, "", url);
    window.dispatchEvent(new Event(LOCATION_EVENT));
    if (next !== "demo") window.scrollTo(0, 0);
  }, []);

  const navigate = useCallback((next: View) => navTo(next), [navTo]);

  const openDemo = useCallback(() => {
    openedInApp.current = true;
    navTo("demo");
  }, [navTo]);

  const exitDemo = useCallback(() => {
    if (openedInApp.current) {
      openedInApp.current = false;
      window.history.back();
    } else {
      navTo("hero");
    }
  }, [navTo]);

  return { view, demoOpen, navigate, openDemo, exitDemo };
}
