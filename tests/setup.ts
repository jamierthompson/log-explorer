// Register @testing-library/jest-dom matchers on Vitest's expect.
import "@testing-library/jest-dom/vitest";

/*
 * jsdom lacks layout-related APIs that Radix primitives reach for:
 * - ResizeObserver: ScrollArea instantiates one on mount.
 * - scrollIntoView / window.scrollTo: keyboard nav and viewport
 *   auto-scroll call into these.
 *
 * No-op stubs are enough for unit tests since they assert rendered
 * DOM, not resize-driven layout.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver;

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(
  globalThis as { IntersectionObserver: typeof IntersectionObserver }
).IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver;

window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
