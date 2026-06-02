import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScrollToTop } from "@/components/features/scroll-to-top/scroll-to-top";

/**
 * jsdom reports zeros for scroll geometry, so drive the component's
 * visibility logic by defining the values its scroll handler reads.
 */
function setScroll({
  scrollY,
  innerHeight = 800,
}: {
  scrollY: number;
  innerHeight?: number;
}) {
  Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: innerHeight, configurable: true });
}

/** Build a DOMRect stand-in (jsdom has no layout to produce real ones). */
function rect(left: number, top: number, right: number, bottom: number): DOMRect {
  return {
    left, top, right, bottom, width: right - left, height: bottom - top, x: left, y: top,
    toJSON() {},
  } as DOMRect;
}

describe("ScrollToTop", () => {
  beforeEach(() => {
    // jsdom lacks matchMedia; the click handler queries reduced-motion.
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
    setScroll({ scrollY: 0 });
  });

  it("is hidden and out of the tab order at the top of the page", () => {
    render(<ScrollToTop />);
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    expect(btn).not.toHaveAttribute("data-visible");
    expect(btn).toHaveAttribute("tabindex", "-1");
  });

  it("appears and joins the tab order once scrolled well past the top", () => {
    render(<ScrollToTop />);
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    act(() => {
      setScroll({ scrollY: 2000 });
      fireEvent.scroll(window);
    });
    expect(btn).toHaveAttribute("data-visible");
    expect(btn).toHaveAttribute("tabindex", "0");
  });

  it("retreats when it would overlap the footer (narrow, full-width footer)", () => {
    render(
      <>
        <footer data-testid="footer" />
        <ScrollToTop />
      </>,
    );
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    const footer = screen.getByTestId("footer");
    vi.spyOn(btn, "getBoundingClientRect").mockReturnValue(rect(300, 700, 344, 744));
    vi.spyOn(footer, "getBoundingClientRect").mockReturnValue(rect(0, 680, 1280, 760));
    act(() => {
      setScroll({ scrollY: 2000 });
      fireEvent.scroll(window);
    });
    expect(btn).not.toHaveAttribute("data-visible");
  });

  it("stays visible at the bottom when the footer is clear of it (wide, centered footer)", () => {
    render(
      <>
        <footer data-testid="footer" />
        <ScrollToTop />
      </>,
    );
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    const footer = screen.getByTestId("footer");
    vi.spyOn(btn, "getBoundingClientRect").mockReturnValue(rect(1173, 800, 1217, 844));
    vi.spyOn(footer, "getBoundingClientRect").mockReturnValue(rect(200, 800, 1047, 880));
    act(() => {
      setScroll({ scrollY: 2000 });
      fireEvent.scroll(window);
    });
    expect(btn).toHaveAttribute("data-visible");
  });

  it("scrolls back to the top when clicked", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ScrollToTop />);
    act(() => {
      setScroll({ scrollY: 2000 });
      fireEvent.scroll(window);
    });
    await user.click(screen.getByRole("button", { name: "Scroll to top" }));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });
});
