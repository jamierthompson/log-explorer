import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Keycap, KeycapSequence } from "@/components/ui/keycap/keycap";

describe("Keycap", () => {
  it("renders its children inside a <kbd> element", () => {
    const { container } = render(<Keycap>E</Keycap>);
    const kbd = container.querySelector("kbd");
    expect(kbd).not.toBeNull();
    expect(kbd?.textContent).toBe("E");
  });
});

describe("KeycapSequence", () => {
  it("renders one <kbd> per key", () => {
    const { container } = render(<KeycapSequence keys={["Shift", "E"]} />);
    expect(container.querySelectorAll("kbd")).toHaveLength(2);
  });

  it("renders a + between consecutive keys", () => {
    render(<KeycapSequence keys={["Shift", "E"]} />);
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("does not render a + for a single-key sequence", () => {
    render(<KeycapSequence keys={["E"]} />);
    expect(screen.queryByText("+")).not.toBeInTheDocument();
  });

  it("is hidden from assistive tech", () => {
    const { container } = render(<KeycapSequence keys={["E"]} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
