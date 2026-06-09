import {
  DEFAULT_CONTEXT_RANGE,
  type OpenContext,
} from "@/demo/lib/context-state";
import {
  hasAnyFilter,
  scenarioIsActive,
  type FilterState,
  type ScenarioPreset,
} from "@/demo/lib/filter-state";

/**
 * The read-only view of investigation progress that `LogExplorer` reports
 * to its host.
 */
export type LogExplorerSnapshot = {
  /** Whether any filter facet is active. */
  readonly hasFilter: boolean;
  /** Ids of the scenario presets the active filter currently satisfies. */
  readonly activeScenarioIds: readonly string[];
  /** Number of open context windows. */
  readonly openContextCount: number;
  /** Whether any open window has been grown past its default range. */
  readonly hasExpandedContext: boolean;
};

/** Build the snapshot from the explorer's internal state. Pure. */
export function deriveSnapshot(
  filterState: FilterState,
  openContexts: readonly OpenContext[],
  scenarios: readonly ScenarioPreset[],
): LogExplorerSnapshot {
  return {
    hasFilter: hasAnyFilter(filterState),
    activeScenarioIds: scenarios
      .filter((s) => scenarioIsActive(filterState, s.scenario))
      .map((s) => s.id),
    openContextCount: openContexts.length,
    hasExpandedContext: openContexts.some(
      (c) => c.range > DEFAULT_CONTEXT_RANGE,
    ),
  };
}
