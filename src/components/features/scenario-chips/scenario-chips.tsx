"use client";

import type { Dispatch } from "react";

import { Chip } from "@/components/ui/chip/chip";
import {
  scenarioIsActive,
  type FilterAction,
  type FilterState,
  type ScenarioPreset,
} from "@/lib/filter-state";

import styles from "./scenario-chips.module.css";

export const SCENARIOS: readonly ScenarioPreset[] = [
  {
    id: "errors",
    label: "Errors only",
    scenario: { instances: [], requestIds: [], levels: ["ERROR"] },
  },
  {
    id: "trace",
    label: "Trace req=r4d8a2",
    scenario: { instances: [], requestIds: ["r4d8a2"], levels: [] },
  },
  {
    id: "instance",
    label: "Instance kc4qn",
    scenario: { instances: ["kc4qn"], requestIds: [], levels: [] },
  },
];

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
