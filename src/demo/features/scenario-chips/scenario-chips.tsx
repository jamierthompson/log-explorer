"use client";

import { type Dispatch } from "react";

import { Chip } from "@/demo/ui/chip/chip";
import {
  scenarioIsActive,
  type FilterAction,
  type FilterState,
} from "@/demo/lib/filter-state";
import { SCENARIOS } from "@/demo/lib/scenarios";

import styles from "./scenario-chips.module.css";

export function ScenarioChips({
  state,
  dispatch,
}: {
  state: FilterState;
  dispatch: Dispatch<FilterAction>;
}) {
  return (
    <div className={styles.row} role="toolbar" aria-label="Filters">
      {SCENARIOS.map((preset) => (
        <Chip
          key={preset.id}
          active={scenarioIsActive(state, preset.scenario)}
          title={preset.hint}
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
