// Register @testing-library/jest-dom matchers on Vitest's expect.
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/*
 * Font-loader factories only exist under the framework's compiler, not a
 * plain test transform — and the demo's public barrel exports its font,
 * so any test importing the barrel evaluates them. Stub the module with
 * the same shape the real factories return.
 */
vi.mock("next/font/google", () => {
  const fontStub = () => ({ className: "", variable: "", style: {} });
  return { JetBrains_Mono: fontStub, Newsreader: fontStub };
});

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
