import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Kicker } from "@/site/ui/kicker/kicker";

describe("Kicker", () => {
  it("renders its label text in a paragraph by default", () => {
    render(<Kicker>The old way</Kicker>);
    const label = screen.getByText("The old way");
    expect(label.tagName).toBe("P");
    // The muted default carries no tone marker.
    expect(label).not.toHaveAttribute("data-tone");
  });

  it("marks the accent tone for styling", () => {
    render(<Kicker tone="accent">See it for yourself</Kicker>);
    expect(screen.getByText("See it for yourself")).toHaveAttribute(
      "data-tone",
      "accent",
    );
  });

  it("renders as the requested element", () => {
    render(<Kicker as="h2">Root cause found</Kicker>);
    expect(
      screen.getByRole("heading", { level: 2, name: "Root cause found" }),
    ).toBeInTheDocument();
  });

  it("merges a caller className with the base class", () => {
    render(<Kicker className="extra">Act 1</Kicker>);
    expect(screen.getByText("Act 1")).toHaveClass("extra");
  });
});
