import { describe, expect, it } from "vitest";

import { deriveSnapshot } from "@/demo/features/log-explorer/log-explorer-state";
import {
  CONTEXT_RANGE_STEP,
  DEFAULT_CONTEXT_RANGE,
} from "@/demo/lib/context-state";
import type { FilterState, ScenarioPreset } from "@/demo/lib/filter-state";

const EMPTY_FILTER: FilterState = { instances: [], requestIds: [], levels: [] };

const SCENARIOS: readonly ScenarioPreset[] = [
  {
    id: "trace",
    label: "Trace",
    scenario: { instances: [], requestIds: ["req-1"], levels: [] },
  },
  {
    id: "errors",
    label: "Errors",
    scenario: { instances: [], requestIds: [], levels: ["ERROR"] },
  },
];

describe("deriveSnapshot", () => {
  it("reports an idle explorer when nothing is filtered or open", () => {
    expect(deriveSnapshot(EMPTY_FILTER, [], SCENARIOS)).toEqual({
      hasFilter: false,
      activeScenarioIds: [],
      openContextCount: 0,
      hasExpandedContext: false,
    });
  });

  it("flags the active filter and the scenarios it satisfies", () => {
    const filter: FilterState = {
      instances: [],
      requestIds: ["req-1"],
      levels: [],
    };
    const snapshot = deriveSnapshot(filter, [], SCENARIOS);
    expect(snapshot.hasFilter).toBe(true);
    expect(snapshot.activeScenarioIds).toEqual(["trace"]);
  });

  it("counts open context windows", () => {
    const snapshot = deriveSnapshot(
      EMPTY_FILTER,
      [
        { selectedLineId: "a", range: DEFAULT_CONTEXT_RANGE },
        { selectedLineId: "b", range: DEFAULT_CONTEXT_RANGE },
      ],
      SCENARIOS,
    );
    expect(snapshot.openContextCount).toBe(2);
  });

  it("marks hasExpandedContext only once a window grows past the default range", () => {
    const atDefault = deriveSnapshot(
      EMPTY_FILTER,
      [{ selectedLineId: "a", range: DEFAULT_CONTEXT_RANGE }],
      SCENARIOS,
    );
    expect(atDefault.hasExpandedContext).toBe(false);

    const expanded = deriveSnapshot(
      EMPTY_FILTER,
      [
        {
          selectedLineId: "a",
          range: DEFAULT_CONTEXT_RANGE + CONTEXT_RANGE_STEP,
        },
      ],
      SCENARIOS,
    );
    expect(expanded.hasExpandedContext).toBe(true);
  });
});
