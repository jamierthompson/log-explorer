import { describe, expect, it } from "vitest";

import type { OpenContext } from "@/demo/lib/context-state";
import { deriveLines } from "@/demo/lib/derive-lines";
import { initialFilterState, type FilterState } from "@/demo/lib/filter-state";
import type { LogLine } from "@/demo/types/log";

const lines: readonly LogLine[] = [
  { id: "1", timestamp: 0, instance: "kc4qn", level: "INFO", message: "a" },
  { id: "2", timestamp: 1, instance: "m7w3p", level: "INFO", message: "b" },
  {
    id: "3",
    timestamp: 2,
    instance: "kc4qn",
    level: "INFO",
    message: "c",
    requestId: "r4d8a2",
  },
  { id: "4", timestamp: 3, instance: "m7w3p", level: "ERROR", message: "d" },
  {
    id: "5",
    timestamp: 4,
    instance: "kc4qn",
    level: "INFO",
    message: "e",
    requestId: "r4d8a2",
  },
];

const traceFilter: FilterState = {
  instances: [],
  requestIds: ["r4d8a2"],
  levels: [],
};

describe("deriveLines", () => {
  it("with no filter and no contexts, every line is visible and not dimmed", () => {
    const derived = deriveLines(lines, initialFilterState, []);
    for (const l of derived) {
      expect(l.isVisible).toBe(true);
      expect(l.isDimmed).toBe(false);
    }
  });

  it("filter only: matching lines visible, non-matching hidden", () => {
    const derived = deriveLines(lines, traceFilter, []);
    expect(derived.find((l) => l.id === "3")?.isVisible).toBe(true);
    expect(derived.find((l) => l.id === "5")?.isVisible).toBe(true);
    expect(derived.find((l) => l.id === "1")?.isVisible).toBe(false);
    expect(derived.find((l) => l.id === "2")?.isVisible).toBe(false);
    expect(derived.find((l) => l.id === "4")?.isVisible).toBe(false);
    // No lines are dimmed when there's no context window.
    for (const l of derived) {
      expect(l.isDimmed).toBe(false);
    }
  });

  it("context window reveals surrounding non-matching lines as dimmed", () => {
    const ctx: OpenContext[] = [{ selectedLineId: "3", range: 1 }];
    const derived = deriveLines(lines, traceFilter, ctx);
    // Anchor (id "3", index 2) visible and not dimmed.
    expect(derived.find((l) => l.id === "3")?.isVisible).toBe(true);
    expect(derived.find((l) => l.id === "3")?.isDimmed).toBe(false);
    // Neighbors within range=1 (indices 1 and 3) visible and dimmed.
    expect(derived.find((l) => l.id === "2")?.isVisible).toBe(true);
    expect(derived.find((l) => l.id === "2")?.isDimmed).toBe(true);
    expect(derived.find((l) => l.id === "4")?.isVisible).toBe(true);
    expect(derived.find((l) => l.id === "4")?.isDimmed).toBe(true);
    // Outside the window and non-matching: hidden.
    expect(derived.find((l) => l.id === "1")?.isVisible).toBe(false);
    // Matching but outside the window: still visible via the filter.
    expect(derived.find((l) => l.id === "5")?.isVisible).toBe(true);
    expect(derived.find((l) => l.id === "5")?.isDimmed).toBe(false);
  });

  it("silences a context window whose anchor doesn't pass the active filter", () => {
    // Open a context on line "1" (matches no-filter), then apply the
    // trace filter — line "1" doesn't pass it. The window goes silent
    // in the view (state preservation is the caller's responsibility).
    const ctx: OpenContext[] = [{ selectedLineId: "1", range: 1 }];
    const derived = deriveLines(lines, traceFilter, ctx);
    expect(derived.find((l) => l.id === "1")?.isVisible).toBe(false);
    // Neighbor of the silenced anchor isn't revealed.
    expect(derived.find((l) => l.id === "2")?.isVisible).toBe(false);
  });

  it("union of two non-overlapping contexts: both windows reveal their neighbors", () => {
    const ctx: OpenContext[] = [
      { selectedLineId: "3", range: 0 },
      { selectedLineId: "5", range: 0 },
    ];
    const derived = deriveLines(lines, traceFilter, ctx);
    // Just the two anchors are visible.
    expect(derived.find((l) => l.id === "3")?.isVisible).toBe(true);
    expect(derived.find((l) => l.id === "5")?.isVisible).toBe(true);
  });

  it("tags each line with its position in the full stream", () => {
    const derived = deriveLines(lines, initialFilterState, []);
    expect(derived.map((l) => l.index)).toEqual([0, 1, 2, 3, 4]);
    // index is the stream position regardless of which filter is active —
    // it's derived before any visibility narrowing.
    const filtered = deriveLines(lines, traceFilter, []);
    expect(filtered.find((l) => l.id === "3")?.index).toBe(2);
    expect(filtered.find((l) => l.id === "5")?.index).toBe(4);
  });

  it("marks inContext for lines within ±range of an open, matching anchor", () => {
    const ctx: OpenContext[] = [{ selectedLineId: "3", range: 1 }];
    const derived = deriveLines(lines, traceFilter, ctx);
    // Anchor (index 2) and its ±1 neighbors (indices 1 and 3) are in context.
    expect(derived.find((l) => l.id === "2")?.inContext).toBe(true);
    expect(derived.find((l) => l.id === "3")?.inContext).toBe(true);
    expect(derived.find((l) => l.id === "4")?.inContext).toBe(true);
    // Outside the ±1 window: not in context.
    expect(derived.find((l) => l.id === "1")?.inContext).toBe(false);
    expect(derived.find((l) => l.id === "5")?.inContext).toBe(false);
  });

  it("does not mark inContext when the anchor doesn't pass the active filter", () => {
    // Anchor on line "1" doesn't pass the trace filter, so its window is
    // silent — no line, including the anchor itself, is in context.
    const ctx: OpenContext[] = [{ selectedLineId: "1", range: 1 }];
    const derived = deriveLines(lines, traceFilter, ctx);
    for (const l of derived) {
      expect(l.inContext).toBe(false);
    }
  });
});
