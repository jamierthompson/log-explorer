"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The two base pages of the landing experience. The live demo is an
 * overlay layered on top of these rather than a base view of its own.
 */
export type View = "hero" | "story";

/** Map a URL hash to a base view, defaulting to the hero. */
export function viewFromHash(hash: string): View {
  return hash === "#story" ? "story" : "hero";
}

/**
 * Hash-driven routing for the landing experience. The view is reflected
 * in the URL (`#story`, or a bare path for the hero) so links, reloads,
 * and back/forward all land on the right page.
 *
 * Starts at the hero on the server and first client render, then
 * reconciles to the URL hash after mount — the only safe way to read a
 * client-only value without a hydration mismatch.
 */
export function useHashRoute(): {
  view: View;
  navigate: (view: View) => void;
} {
  const [view, setView] = useState<View>("hero");

  useEffect(() => {
    const sync = () => setView(viewFromHash(window.location.hash));
    sync();
    // popstate covers back/forward; hashchange covers a hash edited or
    // linked to directly. pushState (below) fires neither, so the two
    // never double up.
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const navigate = useCallback((next: View) => {
    const url =
      next === "hero"
        ? window.location.pathname + window.location.search
        : `#${next}`;
    window.history.pushState({ view: next }, "", url);
    setView(next);
    window.scrollTo(0, 0);
  }, []);

  return { view, navigate };
}
