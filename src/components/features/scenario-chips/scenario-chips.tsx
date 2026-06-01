"use client";

import type { Dispatch } from "react";

import { Chip } from "@/components/ui/chip/chip";
import {
  scenarioIsActive,
  type FilterAction,
  type FilterState,
} from "@/lib/filter-state";
import { SCENARIOS } from "@/lib/scenarios";

import styles from "./scenario-chips.module.css";

export function ScenarioChips({
  state,
  dispatch,
}: {
  state: FilterState;
  dispatch: Dispatch<FilterAction>;
}) {
  return (
    <div
      className={styles.bar}
      role="toolbar"
      aria-label="Filter scenarios"
    >
      {SCENARIOS.map((preset) => (
        <Chip
          key={preset.id}
          active={scenarioIsActive(state, preset.scenario)}
          onClick={() =>
            dispatch({ type: "toggleScenario", scenario: preset.scenario })
          }
        >
          {preset.label}
        </Chip>
      ))}
    </div>
  );
}
