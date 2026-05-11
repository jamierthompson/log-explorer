import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Chip } from "@/components/ui/chip/chip";

describe("Chip", () => {
  it("is unpressed and has no data-active by default", () => {
    render(<Chip>Hello</Chip>);
    const btn = screen.getByRole("button", { name: "Hello" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).not.toHaveAttribute("data-active");
  });

  it("is pressed and data-active when active", () => {
    render(<Chip active>Hello</Chip>);
    const btn = screen.getByRole("button", { name: "Hello" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-active", "true");
  });

  it("fires onClick when activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Hello</Chip>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
