import type { DerivedLogLine, LogLine } from "@/types/log";

import type { OpenContext } from "./context-state";
import { lineMatchesFilter, type FilterState } from "./filter-state";

/**
 * For each line:
 *   matchesFilter      = passes all active filters (AND across facets, OR within)
 *   inAnyContextWindow = sits within ±range of an open context's anchor
 *
 *   isVisible = matchesFilter || inAnyContextWindow
 *   isDimmed  = isVisible && !matchesFilter
 *
 * A context window is silent in the view when its anchor doesn't pass
 * the current filter. The open-context state itself is preserved
 * upstream by the chip-aware retention rule, so the window reappears
 * if a restrictive chip is later removed.
 */
export function deriveLines(
  lines: readonly LogLine[],
  filter: FilterState,
  openContexts: readonly OpenContext[] = [],
): DerivedLogLine[] {
  const indexById = new Map<string, number>();
  for (let i = 0; i < lines.length; i++) {
    indexById.set(lines[i].id, i);
  }

  const activeWindows: { selectedIndex: number; range: number }[] = [];
  for (const ctx of openContexts) {
    const idx = indexById.get(ctx.selectedLineId);
    if (idx === undefined) continue;
    if (!lineMatchesFilter(lines[idx], filter)) continue;
    activeWindows.push({ selectedIndex: idx, range: ctx.range });
  }

  return lines.map((line, index) => {
    const matchesFilter = lineMatchesFilter(line, filter);
    const inAnyContextWindow = activeWindows.some(
      (w) => Math.abs(index - w.selectedIndex) <= w.range,
    );
    const isVisible = matchesFilter || inAnyContextWindow;
    const isDimmed = isVisible && !matchesFilter;
    return { ...line, isVisible, isDimmed };
  });
}
