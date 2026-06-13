import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useContextWindows } from "@/demo/features/log-explorer/use-context-windows";
import type { FilterState } from "@/demo/lib/filter-state";
import { SCENARIOS } from "@/demo/lib/scenarios";
import type { LogLine } from "@/demo/types/log";

// 60 lines so an anchor in the middle isn't at the file boundary and
// expansion can actually fire. Every 10th line carries the r4d8a2
// request id so it matches the trace filter.
const lines: readonly LogLine[] = Array.from({ length: 60 }, (_, i) => ({
  id: String(i + 1),
  timestamp: i,
  instance: "kc4qn",
  level: "INFO",
  message: `line ${i + 1}`,
  ...(i % 10 === 0 ? { requestId: "r4d8a2" as const } : {}),
}));

const linesById = new Map(lines.map((l) => [l.id, l]));
const linesIndexById = new Map(lines.map((l, i) => [l.id, i]));
const traceFilter: FilterState = {
  instances: [],
  requestIds: ["r4d8a2"],
  levels: [],
};

function setup(filterState: FilterState = traceFilter) {
  return renderHook(
    ({ filter }: { filter: FilterState }) =>
      useContextWindows({
        lines,
        linesById,
        linesIndexById,
        filterState: filter,
        scenarios: SCENARIOS,
      }),
    { initialProps: { filter: filterState } },
  );
}

const emptyFilter: FilterState = {
  instances: [],
  requestIds: [],
  levels: [],
};

const errorsFilter: FilterState = {
  instances: [],
  requestIds: [],
  levels: ["ERROR"],
};

const traceAndErrors: FilterState = {
  instances: [],
  requestIds: ["r4d8a2"],
  levels: ["ERROR"],
};

describe("useContextWindows", () => {
  it("starts with no open contexts", () => {
    const { result } = setup();
    expect(result.current.openContexts).toHaveLength(0);
  });

  it("seeds open contexts from initialContexts, for a restored session", () => {
    const seed = [{ selectedLineId: "1", range: 40 }];
    const { result } = renderHook(() =>
      useContextWindows({
        lines,
        linesById,
        linesIndexById,
        filterState: traceFilter,
        scenarios: SCENARIOS,
        initialContexts: seed,
      }),
    );
    expect(result.current.openContexts).toEqual(seed);
    // The seeded anchor still matches the seeded filter, so its accent shows.
    expect(result.current.selectedContextLineIds.has("1")).toBe(true);
  });

  it("toggleContext on a filter-matched line opens a context", () => {
    const { result } = setup();
    act(() => result.current.toggleContext("31"));
    expect(result.current.openContexts).toHaveLength(1);
    expect(result.current.openContexts[0].selectedLineId).toBe("31");
  });

  it("toggleContext on an existing anchor closes that context", () => {
    const { result } = setup();
    act(() => result.current.toggleContext("31"));
    act(() => result.current.toggleContext("31"));
    expect(result.current.openContexts).toHaveLength(0);
  });

  it("closeMostRecentContext pops the last opened context (LIFO)", () => {
    const { result } = setup();
    act(() => result.current.toggleContext("11"));
    act(() => result.current.toggleContext("41"));
    expect(result.current.openContexts).toHaveLength(2);

    act(() => result.current.closeMostRecentContext());
    expect(result.current.openContexts).toHaveLength(1);
    expect(result.current.openContexts[0].selectedLineId).toBe("11");
  });

  it("closeMostRecentContext on an empty list is a no-op", () => {
    const { result } = setup();
    const before = result.current.openContexts;
    const beforePulse = result.current.closePulseKey;
    act(() => result.current.closeMostRecentContext());
    expect(result.current.openContexts).toBe(before);
    // No context closed, so the acknowledgement pulse must not fire.
    expect(result.current.closePulseKey).toBe(beforePulse);
  });

  it("closePulseKey bumps on every successful close", () => {
    const { result } = setup();
    act(() => result.current.toggleContext("31"));
    const before = result.current.closePulseKey;
    act(() => result.current.closeMostRecentContext());
    expect(result.current.closePulseKey).toBe(before + 1);
  });

  it("closeAllContexts clears every context", () => {
    const { result } = setup();
    act(() => result.current.toggleContext("11"));
    act(() => result.current.toggleContext("41"));

    act(() => result.current.closeAllContexts());
    expect(result.current.openContexts).toHaveLength(0);
  });

  it("expandPulseKey bumps on every successful expand", () => {
    const { result } = setup();
    act(() => result.current.toggleContext("31"));
    const before = result.current.expandPulseKey;
    act(() => result.current.expandMostRecentContext());
    expect(result.current.expandPulseKey).toBe(before + 1);
  });

  it("toggleContext is a no-op when no filter is active", () => {
    const { result } = setup(emptyFilter);
    act(() => result.current.toggleContext("31"));
    expect(result.current.openContexts).toHaveLength(0);
  });

  it("toggleContext is a no-op on a line that doesn't pass the filter", () => {
    const { result } = setup();
    // line "5" has no requestId so doesn't match the trace filter.
    act(() => result.current.toggleContext("5"));
    expect(result.current.openContexts).toHaveLength(0);
  });

  it("expandMostRecentContext stops at the file boundary without bumping pulseKey", () => {
    const { result } = setup();
    // Anchor at index 0 — every expand grows symmetrically until the
    // longer side meets the far end. After enough expands the range
    // matches the longest distance and further expands must no-op.
    act(() => result.current.toggleContext("1"));
    while (true) {
      const beforeRange = result.current.openContexts[0].range;
      const beforePulse = result.current.expandPulseKey;
      act(() => result.current.expandMostRecentContext());
      if (
        result.current.openContexts[0].range === beforeRange &&
        result.current.expandPulseKey === beforePulse
      ) {
        break;
      }
    }
    const settledRange = result.current.openContexts[0].range;
    const settledPulse = result.current.expandPulseKey;
    act(() => result.current.expandMostRecentContext());
    expect(result.current.openContexts[0].range).toBe(settledRange);
    expect(result.current.expandPulseKey).toBe(settledPulse);
  });

  it("retains contexts when a more restrictive chip is added but at least one active chip still matches the anchor", () => {
    const { result, rerender } = setup();
    // Open a context under the trace filter on the matching line "11".
    act(() => result.current.toggleContext("11"));
    expect(result.current.openContexts).toHaveLength(1);

    // Layer on the errors chip — line "11" is INFO so it stops
    // matching the combined filter, but the trace chip on its own
    // still matches it. Retention rule: keep the context.
    rerender({ filter: traceAndErrors });
    expect(result.current.openContexts).toHaveLength(1);
    expect(result.current.openContexts[0].selectedLineId).toBe("11");

    // The anchor is filtered out of the view, so its accent goes silent.
    expect(result.current.selectedContextLineIds.has("11")).toBe(false);
  });

  it("drops contexts when no remaining active chip matches the anchor", () => {
    const { result, rerender } = setup();
    act(() => result.current.toggleContext("11"));

    // Swap trace for errors-only. No active chip individually matches
    // an INFO line with requestId r4d8a2, so the context is dropped.
    rerender({ filter: errorsFilter });
    expect(result.current.openContexts).toHaveLength(0);
  });

  it("clearing all chips clears every open context", () => {
    const { result, rerender } = setup();
    act(() => result.current.toggleContext("11"));
    act(() => result.current.toggleContext("41"));
    expect(result.current.openContexts).toHaveLength(2);

    rerender({ filter: emptyFilter });
    expect(result.current.openContexts).toHaveLength(0);
  });
});
