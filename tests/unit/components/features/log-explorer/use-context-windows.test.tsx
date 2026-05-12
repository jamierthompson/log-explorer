import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SCENARIOS } from "@/components/features/scenario-chips/scenario-chips";
import { useContextWindows } from "@/components/features/log-explorer/use-context-windows";
import type { FilterState } from "@/lib/filter-state";
import type { LogLine } from "@/types/log";

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

function setup() {
  return renderHook(() =>
    useContextWindows({
      lines,
      linesById,
      linesIndexById,
      filterState: traceFilter,
      scenarios: SCENARIOS,
    }),
  );
}

describe("useContextWindows", () => {
  it("starts with no open contexts", () => {
    const { result } = setup();
    expect(result.current.openContexts).toHaveLength(0);
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
    act(() => result.current.closeMostRecentContext());
    expect(result.current.openContexts).toBe(before);
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
});
