import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

describe("ScrollArea", () => {
  it("makes the viewport a focusable labeled region when focusLabel is set", () => {
    render(<ScrollArea focusLabel="Page content">body</ScrollArea>);

    const viewport = screen.getByRole("region", { name: "Page content" });
    // Focusable so keyboard-only users can reach the scroller and drive
    // it with the arrow keys even when nothing inside takes focus.
    expect(viewport).toHaveAttribute("tabindex", "0");
  });

  it("keeps the viewport out of the tab order by default", () => {
    const { container } = render(<ScrollArea>body</ScrollArea>);

    const viewport = container.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    expect(viewport).not.toHaveAttribute("tabindex");
    expect(viewport).not.toHaveAttribute("role");
  });
});
