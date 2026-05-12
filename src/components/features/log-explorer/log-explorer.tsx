"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

import { ScenarioChips } from "@/components/features/scenario-chips/scenario-chips";
import {
  filterReducer,
  initialFilterState,
  lineMatchesFilter,
} from "@/lib/filter-state";
import type { LogLine } from "@/types/log";

import { LogList } from "./log-list";
import { useListboxKeyboard } from "./use-listbox-keyboard";

export function LogExplorer({ lines }: { lines: readonly LogLine[] }) {
  const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);

  const visibleLines = useMemo(
    () => lines.filter((line) => lineMatchesFilter(line, filterState)),
    [lines, filterState],
  );

  const handleKeyDown = useListboxKeyboard({
    lines: visibleLines,
    focusedLineId,
    setFocusedLineId,
  });

  useEffect(() => {
    if (!focusedLineId) return;
    document
      .getElementById(`line_${focusedLineId}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [focusedLineId]);

  return (
    <>
      <ScenarioChips state={filterState} dispatch={dispatch} />
      <LogList
        lines={visibleLines}
        focusedLineId={focusedLineId}
        onKeyDown={handleKeyDown}
      />
    </>
  );
}
