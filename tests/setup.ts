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
 * jsdom lacks layout APIs the UI primitives reach for (resize
 * observation, programmatic scrolling). No-op stubs suffice since unit
 * tests assert rendered DOM, not layout.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver;

window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
