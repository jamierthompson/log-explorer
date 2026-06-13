import { describe, expect, it } from "vitest";

import { initialFilterState } from "@/demo/lib/filter-state";
import { filterFromScenarioIds } from "@/demo/lib/scenarios";

describe("filterFromScenarioIds", () => {
  it("maps a known scenario id to its filter facets", () => {
    expect(filterFromScenarioIds(["errors"])).toEqual({
      instances: [],
      requestIds: [],
      levels: ["ERROR"],
    });
  });

  it("stacks multiple ids across facets", () => {
    expect(filterFromScenarioIds(["errors", "instance"])).toEqual({
      instances: ["kc4qn"],
      requestIds: [],
      levels: ["ERROR"],
    });
  });

  it("ignores unknown ids", () => {
    expect(filterFromScenarioIds(["nope"])).toEqual(initialFilterState);
    expect(filterFromScenarioIds(["errors", "nope"])).toEqual(
      filterFromScenarioIds(["errors"]),
    );
  });

  it("returns the empty filter for no ids", () => {
    expect(filterFromScenarioIds([])).toEqual(initialFilterState);
  });
});
