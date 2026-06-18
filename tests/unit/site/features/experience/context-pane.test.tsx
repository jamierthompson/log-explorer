import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LogLine } from "@/demo";
import { ContextPane } from "@/site/features/experience/investigation/context-pane";

const lines: readonly LogLine[] = Array.from({ length: 14 }, (_, i) => ({
  id: `${i}`,
  timestamp: i,
  instance: "kc4qn",
  level: "INFO" as const,
  message: `line ${i}`,
}));

function renderPane(anchorId: string) {
  return render(
    <ContextPane lines={lines} anchorId={anchorId} service="api-gateway" />,
  );
}

describe("ContextPane", () => {
  it("centers a window on the anchor and reports its size", () => {
    renderPane("7");

    // ±DEFAULT_CONTEXT_RANGE around index 7, with room on both sides.
    expect(screen.getByText(/11 lines/)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(11);
    expect(document.querySelector("[data-anchor]")).toHaveTextContent("line 7");
  });

  it("clamps the window at the head of the stream without underflowing", () => {
    // An anchor at index 0 must not slice from a negative start.
    renderPane("0");

    // Start is clamped to 0, so the window is the anchor plus the trailing
    // half only — never a wrapped or empty slice.
    expect(screen.getByText(/6 lines/)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(document.querySelector("[data-anchor]")).toHaveTextContent("line 0");
    expect(screen.getAllByText("line 5")).not.toHaveLength(0);
    expect(screen.queryAllByText("line 6")).toHaveLength(0);
  });

  it("renders no header and no rows when the anchor is gone", () => {
    // A tab can outlive its line; the pane must not read bounds off an
    // empty window.
    renderPane("does-not-exist");

    expect(screen.queryByText(/Context around/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/lines$/)).not.toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
