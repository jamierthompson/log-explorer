import type { Level, LogLine } from "@/demo/types/log";

/**
 * Filter state. Within a facet, values combine with OR; across facets,
 * AND.
 */
export type FilterState = {
  readonly instances: readonly string[];
  readonly requestIds: readonly string[];
  readonly levels: readonly Level[];
};

export const initialFilterState: FilterState = {
  instances: [],
  requestIds: [],
  levels: [],
};

/**
 * A scenario is a full FilterState used as a single-select preset: the
 * chips are lenses, so selecting one makes it the whole active filter and
 * re-selecting the active one clears it. Structurally identical to
 * FilterState by design.
 */
export type Scenario = FilterState;

/** A labeled scenario, ready to render as a chip and consumed by the
 * retention rule that decides which open contexts survive a filter
 * change. */
export type ScenarioPreset = {
  readonly id: string;
  readonly label: string;
  readonly scenario: Scenario;
};

export type FilterAction =
  | { type: "selectScenario"; scenario: Scenario }
  | { type: "clear" };

export function filterReducer(
  state: FilterState,
  action: FilterAction,
): FilterState {
  switch (action.type) {
    case "selectScenario":
      // Single-select: the chosen lens becomes the whole filter, and
      // re-selecting the active lens clears it. A scenario is itself a
      // FilterState, so selecting just swaps it in wholesale.
      return scenarioIsActive(state, action.scenario)
        ? initialFilterState
        : action.scenario;
    case "clear":
      return initialFilterState;
  }
}

export function hasAnyFilter(state: FilterState): boolean {
  return (
    state.instances.length > 0 ||
    state.requestIds.length > 0 ||
    state.levels.length > 0
  );
}

/** Whether every value in `scenario` is already present in `state`. */
export function scenarioIsActive(
  state: FilterState,
  scenario: Scenario,
): boolean {
  return (
    scenario.instances.every((v) => state.instances.includes(v)) &&
    scenario.requestIds.every((v) => state.requestIds.includes(v)) &&
    scenario.levels.every((v) => state.levels.includes(v))
  );
}

/**
 * Whether a line passes the active filter. With no facets active,
 * every line matches.
 */
export function lineMatchesFilter(line: LogLine, filter: FilterState): boolean {
  if (!hasAnyFilter(filter)) return true;
  if (
    filter.instances.length > 0 &&
    !filter.instances.includes(line.instance)
  ) {
    return false;
  }
  if (filter.requestIds.length > 0) {
    if (!line.requestId || !filter.requestIds.includes(line.requestId)) {
      return false;
    }
  }
  if (filter.levels.length > 0 && !filter.levels.includes(line.level)) {
    return false;
  }
  return true;
}
