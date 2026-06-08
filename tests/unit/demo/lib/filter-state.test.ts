import { describe, expect, it } from "vitest";

import {
  filterReducer,
  hasAnyFilter,
  initialFilterState,
  lineMatchesFilter,
  scenarioIsActive,
  type Scenario,
} from "@/demo/lib/filter-state";
import type { LogLine } from "@/demo/types/log";

const line: LogLine = {
  id: "log_0001",
  timestamp: 0,
  instance: "kc4qn",
  requestId: "r4d8a2",
  level: "INFO",
  message: "Sample",
};

const errorsScenario: Scenario = {
  instances: [],
  requestIds: [],
  levels: ["ERROR"],
};

const instanceScenario: Scenario = {
  instances: ["kc4qn"],
  requestIds: [],
  levels: [],
};

describe("filterReducer", () => {
  it("toggling an inactive scenario adds its values", () => {
    const next = filterReducer(initialFilterState, {
      type: "toggleScenario",
      scenario: errorsScenario,
    });
    expect(next.levels).toEqual(["ERROR"]);
  });

  it("toggling an active scenario removes its values", () => {
    const withErrors = filterReducer(initialFilterState, {
      type: "toggleScenario",
      scenario: errorsScenario,
    });
    const next = filterReducer(withErrors, {
      type: "toggleScenario",
      scenario: errorsScenario,
    });
    expect(next).toEqual(initialFilterState);
  });

  it("toggles independently across facets so multiple scenarios stack", () => {
    let state = filterReducer(initialFilterState, {
      type: "toggleScenario",
      scenario: errorsScenario,
    });
    state = filterReducer(state, {
      type: "toggleScenario",
      scenario: instanceScenario,
    });
    expect(state.levels).toEqual(["ERROR"]);
    expect(state.instances).toEqual(["kc4qn"]);
  });

  it("clear returns the initial state", () => {
    const start = filterReducer(initialFilterState, {
      type: "toggleScenario",
      scenario: errorsScenario,
    });
    expect(filterReducer(start, { type: "clear" })).toEqual(initialFilterState);
  });
});

describe("scenarioIsActive", () => {
  it("is true when every facet value in the scenario is present in state", () => {
    expect(
      scenarioIsActive(
        { instances: ["kc4qn"], requestIds: [], levels: ["ERROR"] },
        errorsScenario,
      ),
    ).toBe(true);
  });

  it("is false when any facet value is missing", () => {
    expect(scenarioIsActive(initialFilterState, errorsScenario)).toBe(false);
  });
});

describe("hasAnyFilter", () => {
  it("is false on the initial state", () => {
    expect(hasAnyFilter(initialFilterState)).toBe(false);
  });

  it("is true when any facet has values", () => {
    expect(hasAnyFilter({ ...initialFilterState, levels: ["ERROR"] })).toBe(
      true,
    );
  });
});

describe("lineMatchesFilter", () => {
  it("matches every line when no filters are active", () => {
    expect(lineMatchesFilter(line, initialFilterState)).toBe(true);
  });

  it("matches when the line's instance is in the filter", () => {
    expect(
      lineMatchesFilter(line, { ...initialFilterState, instances: ["kc4qn"] }),
    ).toBe(true);
  });

  it("rejects when the line's instance is not in the filter", () => {
    expect(
      lineMatchesFilter(line, { ...initialFilterState, instances: ["m7w3p"] }),
    ).toBe(false);
  });

  it("rejects a line with no requestId when requestIds are filtered", () => {
    const noReq: LogLine = { ...line, requestId: undefined };
    expect(
      lineMatchesFilter(noReq, {
        ...initialFilterState,
        requestIds: ["r4d8a2"],
      }),
    ).toBe(false);
  });

  it("ANDs across facets", () => {
    expect(
      lineMatchesFilter(line, {
        instances: ["kc4qn"],
        requestIds: [],
        levels: ["ERROR"],
      }),
    ).toBe(false);
  });

  it("ORs within a facet", () => {
    expect(
      lineMatchesFilter(line, {
        instances: ["kc4qn", "m7w3p"],
        requestIds: [],
        levels: [],
      }),
    ).toBe(true);
  });
});
