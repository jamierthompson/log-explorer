"use client";

import { useId, type Dispatch } from "react";

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
  const labelId = useId();
  return (
    <div className={styles.bar}>
      <p id={labelId} className={styles.label}>
        Filter
      </p>
      <div className={styles.row} role="toolbar" aria-labelledby={labelId}>
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
    </div>
  );
}
