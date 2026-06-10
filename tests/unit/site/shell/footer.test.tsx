import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Footer } from "@/site/shell/footer/footer";

afterEach(() => {
  document
    .querySelectorAll("[data-app-scroll-viewport]")
    .forEach((el) => el.remove());
});

describe("Footer", () => {
  it("returns the reader to the top of the app scroller", async () => {
    const user = userEvent.setup();
    // No reduced-motion preference, so the scroll takes the smooth path.
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const viewport = document.createElement("div");
    viewport.setAttribute("data-app-scroll-viewport", "");
    const scrollTo = vi.fn();
    (viewport as unknown as { scrollTo: typeof scrollTo }).scrollTo = scrollTo;
    document.body.appendChild(viewport);
    render(<Footer />);

    await user.click(screen.getByRole("button", { name: /back to the top/i }));

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, behavior: "smooth" }),
    );
  });

  it("moves focus to the main region along with the scroll", async () => {
    const user = userEvent.setup();
    // Force the reduced-motion branch so the scroll is synchronous in jsdom.
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const viewport = document.createElement("div");
    viewport.setAttribute("data-app-scroll-viewport", "");
    (viewport as unknown as { scrollTo: () => void }).scrollTo = vi.fn();
    document.body.appendChild(viewport);
    const main = document.createElement("main");
    main.id = "main-content";
    main.tabIndex = -1;
    document.body.appendChild(main);
    render(<Footer />);

    await user.click(screen.getByRole("button", { name: /back to the top/i }));

    // The next Tab should continue from the top, not from the footer.
    expect(main).toHaveFocus();
    main.remove();
  });
});
