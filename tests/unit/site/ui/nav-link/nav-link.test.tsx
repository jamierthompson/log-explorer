import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NavLink } from "@/site/ui/nav-link/nav-link";

describe("NavLink", () => {
  it("fires onClick when it renders as a button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavLink onClick={onClick}>Demo</NavLink>);

    await user.click(screen.getByRole("button", { name: "Demo" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders an external link that opens in a new tab", () => {
    render(
      <NavLink href="https://example.com" external>
        Code
      </NavLink>,
    );

    const link = screen.getByRole("link", { name: /code/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
