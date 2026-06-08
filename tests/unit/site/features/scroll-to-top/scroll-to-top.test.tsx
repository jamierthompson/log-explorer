import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScrollToTop } from "@/site/features/scroll-to-top/scroll-to-top";

/**
 * Controllable IntersectionObserver: records each instance and the
 * elements it observes so tests can fire the right observer's callback.
 */
class MockIO {
  static instances: MockIO[] = [];
  callback: IntersectionObserverCallback;
  elements: Element[] = [];
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    MockIO.instances.push(this);
  }
  observe(el: Element) {
    this.elements.push(el);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  fire(entries: Array<Partial<IntersectionObserverEntry>>) {
    this.callback(
      entries as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver,
    );
  }
}

const sentinelObserver = () =>
  MockIO.instances.find((io) => io.elements.some((e) => e.tagName === "DIV"));
const footerObserver = () =>
  MockIO.instances.find((io) =>
    io.elements.some((e) => e.tagName === "FOOTER"),
  );

function rect(
  left: number,
  top: number,
  right: number,
  bottom: number,
): DOMRect {
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON() {},
  } as DOMRect;
}

describe("ScrollToTop", () => {
  beforeEach(() => {
    MockIO.instances = [];
    window.IntersectionObserver =
      MockIO as unknown as typeof IntersectionObserver;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
    }) as unknown as typeof window.matchMedia;
  });

  it("is hidden and inert at the top of the page", () => {
    render(<ScrollToTop />);
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    expect(btn).not.toHaveAttribute("data-visible");
    expect(btn).toHaveAttribute("inert");
  });

  it("appears once the top sentinel scrolls out of view", () => {
    render(<ScrollToTop />);
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    act(() => sentinelObserver()!.fire([{ isIntersecting: false }]));
    expect(btn).toHaveAttribute("data-visible");
    expect(btn).not.toHaveAttribute("inert");
  });

  it("retreats when it would overlap the footer (narrow, full-width footer)", () => {
    render(
      <>
        <footer />
        <ScrollToTop />
      </>,
    );
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    vi.spyOn(btn, "getBoundingClientRect").mockReturnValue(
      rect(300, 700, 344, 744),
    );
    act(() => sentinelObserver()!.fire([{ isIntersecting: false }]));
    act(() =>
      footerObserver()!.fire([
        { isIntersecting: true, boundingClientRect: rect(0, 680, 1280, 760) },
      ]),
    );
    expect(btn).not.toHaveAttribute("data-visible");
  });

  it("stays visible when the footer is clear of it (wide, centered footer)", () => {
    render(
      <>
        <footer />
        <ScrollToTop />
      </>,
    );
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    vi.spyOn(btn, "getBoundingClientRect").mockReturnValue(
      rect(1173, 800, 1217, 844),
    );
    act(() => sentinelObserver()!.fire([{ isIntersecting: false }]));
    act(() =>
      footerObserver()!.fire([
        { isIntersecting: true, boundingClientRect: rect(200, 800, 1047, 880) },
      ]),
    );
    expect(btn).toHaveAttribute("data-visible");
  });

  it("scrolls back to the top when clicked", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ScrollToTop />);
    act(() => sentinelObserver()!.fire([{ isIntersecting: false }]));
    await user.click(screen.getByRole("button", { name: "Scroll to top" }));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });
});
