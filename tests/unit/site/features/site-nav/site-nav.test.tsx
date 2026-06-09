import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SiteNav } from "@/site/features/site-nav/site-nav";

describe("SiteNav", () => {
  it("navigates to the view when its link is pressed", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<SiteNav view="hero" onNavigate={onNavigate} />);

    await user.click(screen.getByRole("button", { name: "Demo" }));
    expect(onNavigate).toHaveBeenCalledWith("demo");
  });

  it("marks the current view's link active", () => {
    render(<SiteNav view="story" onNavigate={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Story" })).toHaveAttribute(
      "data-active",
    );
  });
});
