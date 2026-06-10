import { vi } from "vitest";

/**
 * Builds a matchMedia replacement whose every query reports the given
 * match result. jsdom doesn't implement matchMedia at all, so tests
 * need some implementation before components can ask about media
 * preferences.
 */
export function createMatchMediaStub(
  matches: boolean,
): typeof window.matchMedia {
  return (query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

/**
 * Per-test matchMedia override. Spy-based so `vi.restoreAllMocks()`
 * (or the returned spy's own `mockRestore`) reinstates the suite-wide
 * default — a direct assignment would leak the override into every
 * later test in the file.
 */
export function mockMatchMedia(matches: boolean) {
  return vi
    .spyOn(window, "matchMedia")
    .mockImplementation(createMatchMediaStub(matches));
}
