"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

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
  const viewportRef = useRef<HTMLDivElement>(null);

  const visibleLines = useMemo(
    () => lines.filter((line) => lineMatchesFilter(line, filterState)),
    [lines, filterState],
  );

  const handleKeyDown = useListboxKeyboard({
    lines: visibleLines,
    focusedLineId,
    setFocusedLineId,
  });

  /*
   * Land at the newest line on first paint, matching how tail-style log
   * viewers open. useLayoutEffect runs before the browser paints, so
   * the user never sees the unscrolled position flash by.
   */
  useLayoutEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    v.scrollTop = v.scrollHeight;
  }, []);

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
        viewportRef={viewportRef}
      />
    </>
  );
}
