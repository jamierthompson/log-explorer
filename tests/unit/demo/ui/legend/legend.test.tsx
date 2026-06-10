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

  it("keeps focus on a clickable entry when its pulse re-triggers", () => {
    const makeItems = (pulseKey: number): LegendItem[] => [
      {
        keys: ["Shift", "E"],
        label: "Expand",
        onClick: () => {},
        ariaLabel: "Expand context",
        pulseKey,
      },
    ];
    const { rerender } = render(<Legend items={makeItems(0)} />);
    const button = screen.getByRole("button", { name: "Expand context" });
    button.focus();

    // The pulse acknowledges an activation; it must not remount (and
    // thereby blur) the very button the user just pressed.
    rerender(<Legend items={makeItems(1)} />);
    expect(
      screen.getByRole("button", { name: "Expand context" }),
    ).toHaveFocus();
    expect(screen.getByRole("button", { name: "Expand context" })).toBe(button);
  });

  it("restarts the pulse animation in place when pulseKey bumps", () => {
    const makeItems = (pulseKey: number): LegendItem[] => [
      {
        keys: ["Esc"],
        label: "Close",
        onClick: () => {},
        ariaLabel: "Close context",
        pulseKey,
      },
    ];
    const { rerender } = render(<Legend items={makeItems(0)} />);
    const button = screen.getByRole("button", { name: "Close context" });
    // The restart detaches the animation, forces a style flush via a
    // layout read, and reattaches — the layout read is the observable
    // seam in jsdom.
    const flush = vi.fn(() => 0);
    Object.defineProperty(button, "offsetWidth", { get: flush });

    rerender(<Legend items={makeItems(1)} />);
    expect(flush).toHaveBeenCalledOnce();
    // Reattached: the inline override is cleared so the stylesheet's
    // animation applies fresh.
    expect(button.style.animation).toBe("");

    // Same pulseKey, no replay.
    rerender(<Legend items={makeItems(1)} />);
    expect(flush).toHaveBeenCalledOnce();
  });

  it("renders a question-mark entry like any other (no special label-only path)", () => {
    const items: LegendItem[] = [
      {
        keys: ["?"],
        label: "shortcuts",
        onClick: () => {},
        ariaLabel: "Open shortcuts",
      },
    ];
    const { container } = render(<Legend items={items} />);
    expect(container.querySelectorAll("kbd")).toHaveLength(1);
    expect(screen.getByText("shortcuts")).toBeInTheDocument();
  });
});
