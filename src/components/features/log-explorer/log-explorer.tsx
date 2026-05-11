"use client";

import { useMemo, useReducer } from "react";

import { ScenarioChips } from "@/components/features/scenario-chips/scenario-chips";
import {
  filterReducer,
  initialFilterState,
  lineMatchesFilter,
} from "@/lib/filter-state";
import type { LogLine } from "@/types/log";

import { LogList } from "./log-list";

export function LogExplorer({ lines }: { lines: readonly LogLine[] }) {
  const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);
  const visibleLines = useMemo(
    () => lines.filter((line) => lineMatchesFilter(line, filterState)),
    [lines, filterState],
  );

  return (
    <>
      <ScenarioChips state={filterState} dispatch={dispatch} />
      <LogList lines={visibleLines} />
    </>
  );
}
