"use client";

import { useCallback, useMemo, useState } from "react";

import {
  CONTEXT_RANGE_STEP,
  DEFAULT_CONTEXT_RANGE,
  isAtFileBoundary,
  type OpenContext,
} from "@/demo/lib/context-state";
import {
  hasAnyFilter,
  lineMatchesFilter,
  scenarioIsActive,
  type FilterState,
  type ScenarioPreset,
} from "@/demo/lib/filter-state";
import type { LogLine } from "@/demo/types/log";

const EMPTY_SELECTED_SET: ReadonlySet<string> = new Set();

export function useContextWindows({
  lines,
  linesById,
  linesIndexById,
  filterState,
  scenarios,
}: {
  lines: readonly LogLine[];
  linesById: ReadonlyMap<string, LogLine>;
  linesIndexById: ReadonlyMap<string, number>;
  filterState: FilterState;
  scenarios: readonly ScenarioPreset[];
}) {
  const [openContexts, setOpenContexts] = useState<readonly OpenContext[]>([]);
  /*
   * Counter bumped on every successful expand. Threaded into the
   * Legend's `pulseKey` for the Expand entry so the mount animation
   * replays even when the entry's label and keys are unchanged —
   * a visible acknowledgement that the press took effect.
   */
  const [expandPulseKey, setExpandPulseKey] = useState(0);
  /*
   * Mirror of expandPulseKey for the Close entry. A closed context is
   * often off-screen (the anchor has scrolled out of view), so replaying
   * the entry's animation is the acknowledgement that the press landed —
   * the same role the pulse plays on expand.
   */
  const [closePulseKey, setClosePulseKey] = useState(0);

  /*
   * Drop a context only once every scenario whose individual filter
   * would match its anchor is inactive. Adding a more restrictive
   * scenario can hide the anchor in the view, but the context stays
   * in state as long as the original matching scenario is still
   * active — so removing the restrictive scenario brings the window
   * back. Clearing all filters clears everything.
   *
   * Comparing previous vs incoming props during render lets the
   * pruned state land in the same commit, instead of using a
   * useEffect that would trigger a follow-up render.
   */
  const [previousFilter, setPreviousFilter] =
    useState<FilterState>(filterState);
  if (previousFilter !== filterState) {
    setPreviousFilter(filterState);
    if (!hasAnyFilter(filterState)) {
      if (openContexts.length > 0) setOpenContexts([]);
    } else if (openContexts.length > 0) {
      const cleaned = openContexts.filter((ctx) => {
        const line = linesById.get(ctx.selectedLineId);
        if (!line) return false;
        return scenarios.some(
          (s) =>
            scenarioIsActive(filterState, s.scenario) &&
            lineMatchesFilter(line, s.scenario),
        );
      });
      if (cleaned.length !== openContexts.length) setOpenContexts(cleaned);
    }
  }

  const toggleContext = useCallback(
    (lineId: string) => {
      if (!hasAnyFilter(filterState)) return;
      const line = linesById.get(lineId);
      if (!line || !lineMatchesFilter(line, filterState)) return;

      setOpenContexts((current) => {
        const idx = current.findIndex((c) => c.selectedLineId === lineId);
        if (idx !== -1) {
          return current.filter((_, i) => i !== idx);
        }
        return [
          ...current,
          { selectedLineId: lineId, range: DEFAULT_CONTEXT_RANGE },
        ];
      });
    },
    [filterState, linesById],
  );

  const closeMostRecentContext = useCallback(() => {
    if (openContexts.length === 0) return;
    setOpenContexts((current) => current.slice(0, -1));
    setClosePulseKey((k) => k + 1);
  }, [openContexts.length]);

  const closeAllContexts = useCallback(() => {
    setOpenContexts((current) => (current.length === 0 ? current : []));
  }, []);

  const expandMostRecentContext = useCallback(() => {
    if (openContexts.length === 0) return;
    const last = openContexts[openContexts.length - 1];
    const idx = linesIndexById.get(last.selectedLineId);
    // A missing anchor is treated as a no-op, consistent with the other
    // anchor lookups, which skip rather than fail when an open context outlives its line.
    if (idx === undefined) return;
    if (isAtFileBoundary(idx, last.range, lines.length)) return;

    setOpenContexts((current) =>
      current.map((c, i) =>
        i === current.length - 1
          ? { ...c, range: c.range + CONTEXT_RANGE_STEP }
          : c,
      ),
    );
    setExpandPulseKey((k) => k + 1);
  }, [openContexts, lines.length, linesIndexById]);

  /*
   * Filter-gated set of anchor ids. Open contexts whose anchor stops
   * matching the filter still exist in state (so the window reappears
   * on filter loosening) but their accent doesn't render.
   */
  const selectedContextLineIds = useMemo<ReadonlySet<string>>(() => {
    if (openContexts.length === 0) return EMPTY_SELECTED_SET;
    if (!hasAnyFilter(filterState)) return EMPTY_SELECTED_SET;
    const ids = new Set<string>();
    for (const ctx of openContexts) {
      const selected = linesById.get(ctx.selectedLineId);
      if (!selected) continue;
      if (lineMatchesFilter(selected, filterState)) {
        ids.add(ctx.selectedLineId);
      }
    }
    return ids;
  }, [openContexts, filterState, linesById]);

  return {
    openContexts,
    toggleContext,
    expandMostRecentContext,
    closeMostRecentContext,
    closeAllContexts,
    selectedContextLineIds,
    expandPulseKey,
    closePulseKey,
  };
}
