import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LogList } from "@/demo/features/log-explorer/log-list";
import type { DerivedLogLine } from "@/demo/types/log";

/** A fully-visible derived line at a given stream index. The gap dividers
 * are driven entirely by `index` and `totalLines`, so visibility flags are
 * held constant and only the position varies between cases. */
function visibleLineAt(index: number): DerivedLogLine {
  return {
    id: `line_${index}`,
    timestamp: index,
    instance: "kc4qn",
    level: "INFO",
    message: `message ${index}`,
    index,
    inContext: false,
    isVisible: true,
    isDimmed: false,
  };
}

/** Minimal props for LogList; individual tests override `lines`/`totalLines`. */
function renderList(lines: DerivedLogLine[], totalLines: number) {
  return render(
    <LogList
      lines={lines}
      totalLines={totalLines}
      focusedLineId={null}
      selectedContextLineIds={new Set()}
      hasAnyFilter={false}
      onKeyDown={vi.fn()}
      onLineFocus={vi.fn()}
      onToggleContext={vi.fn()}
    />,
  );
}

describe("LogList gap dividers", () => {
  it("shows a leading divider when the first visible line isn't the start of the stream", () => {
    // First visible line is at stream index 3, so 3 lines are collapsed above it.
    renderList([visibleLineAt(3), visibleLineAt(4)], 5);
    expect(screen.getByText("3 lines hidden")).toBeInTheDocument();
  });

  it("shows no dividers when the visible set covers the whole contiguous stream", () => {
    renderList([visibleLineAt(0), visibleLineAt(1), visibleLineAt(2)], 3);
    expect(screen.queryByText(/lines? hidden/)).not.toBeInTheDocument();
  });

  it("shows a between divider counting the lines skipped between two visible rows", () => {
    // Indices 0 and 4 are visible: 1,2,3 (three lines) are collapsed between them.
    renderList([visibleLineAt(0), visibleLineAt(4)], 5);
    expect(screen.getByText("3 lines hidden")).toBeInTheDocument();
  });

  it("shows a trailing divider when the last visible line isn't the end of the stream", () => {
    // Last visible line is index 1 in a 5-line stream: indices 2,3,4 collapse below.
    renderList([visibleLineAt(0), visibleLineAt(1)], 5);
    expect(screen.getByText("3 lines hidden")).toBeInTheDocument();
  });

  it("uses the singular form when exactly one line is hidden", () => {
    // Indices 0 and 2 visible: only index 1 is collapsed between them.
    renderList([visibleLineAt(0), visibleLineAt(2)], 3);
    expect(screen.getByText("1 line hidden")).toBeInTheDocument();
    expect(screen.queryByText("1 lines hidden")).not.toBeInTheDocument();
  });

  it("renders dividers as presentational, not as listbox options", () => {
    // A contiguous visible pair in the middle yields a leading and trailing divider.
    renderList([visibleLineAt(2), visibleLineAt(3)], 6);

    const dividers = screen.getAllByText(/lines? hidden/);
    expect(dividers).toHaveLength(2);
    for (const divider of dividers) {
      // The label lives inside the presentational <li> wrapper.
      const li = divider.closest("li");
      expect(li).not.toBeNull();
      expect(li).toHaveAttribute("role", "presentation");
      expect(li).toHaveAttribute("aria-hidden", "true");
    }

    // Only the real log rows are exposed as options.
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("places leading, between, and trailing dividers together for a fragmented view", () => {
    // Stream of 10; visible at indices 2 and 7. Above: 2 hidden. Between: 4
    // hidden. Below: 2 hidden.
    renderList([visibleLineAt(2), visibleLineAt(7)], 10);
    const dividers = screen
      .getAllByText(/lines? hidden/)
      .map((el) => el.textContent);
    expect(dividers).toEqual([
      "2 lines hidden",
      "4 lines hidden",
      "2 lines hidden",
    ]);
  });
});
