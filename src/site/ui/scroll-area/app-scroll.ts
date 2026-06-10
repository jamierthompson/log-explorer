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
