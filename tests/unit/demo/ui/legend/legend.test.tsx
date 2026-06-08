import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Legend, type LegendItem } from "@/demo/ui/legend/legend";

describe("Legend", () => {
  it("renders nothing when items is empty", () => {
    const { container } = render(<Legend items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a toolbar with each item's label", () => {
    const items: LegendItem[] = [
      { keys: ["E"], label: "View context" },
      { keys: ["Esc"], label: "Close" },
    ];
    render(<Legend items={items} />);
    expect(
      screen.getByRole("toolbar", { name: /keyboard hints/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("View context")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("renders a keycap per key in each entry", () => {
    const items: LegendItem[] = [
      { keys: ["Shift", "E"], label: "Expand context" },
    ];
    const { container } = render(<Legend items={items} />);
    expect(container.querySelectorAll("kbd")).toHaveLength(2);
  });

  it("renders a clickable entry as a button when onClick is set", () => {
    const onClick = vi.fn();
    const items: LegendItem[] = [
      {
        keys: ["E"],
        label: "View context",
        onClick,
        ariaLabel: "View context on focused line",
      },
    ];
    render(<Legend items={items} />);
    expect(
      screen.getByRole("button", { name: "View context on focused line" }),
    ).toBeInTheDocument();
  });

  it("fires onClick when an entry is activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items: LegendItem[] = [
      {
        keys: ["E"],
        label: "View context",
        onClick,
        ariaLabel: "View context",
      },
    ];
    render(<Legend items={items} />);
    await user.click(screen.getByRole("button", { name: "View context" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a non-clickable entry as a div when onClick is not set", () => {
    const items: LegendItem[] = [{ keys: ["E"], label: "View context" }];
    render(<Legend items={items} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a question-mark entry like any other (no special label-only path)", () => {
    const items: LegendItem[] = [
      {
        keys: ["?"],
        label: "for all shortcuts",
        onClick: () => {},
        ariaLabel: "Open shortcuts",
      },
    ];
    const { container } = render(<Legend items={items} />);
    expect(container.querySelectorAll("kbd")).toHaveLength(1);
    expect(screen.getByText("for all shortcuts")).toBeInTheDocument();
  });
});
