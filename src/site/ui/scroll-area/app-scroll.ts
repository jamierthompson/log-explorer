/**
 * Helpers for driving the single app-level scroller — the viewport the
 * page ScrollArea tags. The page scrolls inside it, not the window, so
 * anything that wants "scroll the page" goes through here.
 */
export function getAppScrollViewport(): Element | null {
  return document.querySelector("[data-app-scroll-viewport]");
}

export function scrollAppViewportToTop(): void {
  const viewport = getAppScrollViewport();
  if (viewport) viewport.scrollTop = 0;
}

/** Animated return to the top, honoring reduced-motion preferences. */
export function smoothScrollAppViewportToTop(): void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  (getAppScrollViewport() ?? window).scrollTo({
    top: 0,
    behavior: reduce ? "auto" : "smooth",
  });
}
