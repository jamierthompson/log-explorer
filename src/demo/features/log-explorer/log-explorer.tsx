"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { ScenarioChips } from "@/demo/features/scenario-chips/scenario-chips";
import { SCENARIOS } from "@/demo/lib/scenarios";
import { ShortcutSheet } from "@/demo/features/shortcut-sheet/shortcut-sheet";
import { Legend, type LegendItem } from "@/demo/ui/legend";
import { isAtFileBoundary } from "@/demo/lib/context-state";
import { deriveLines } from "@/demo/lib/derive-lines";
import {
  filterReducer,
  hasAnyFilter,
  initialFilterState,
  type FilterState,
} from "@/demo/lib/filter-state";
import { SHORTCUTS } from "@/demo/lib/keyboard-shortcuts";
import type { LogLine } from "@/demo/types/log";
import "@/demo/styles/base.css";

import styles from "./log-explorer.module.css";
import { LogList, lineDomId } from "./log-list";
import { useContextWindows } from "./use-context-windows";
import { useListboxKeyboard } from "./use-listbox-keyboard";

export function LogExplorer({
  lines,
  initialFilter = initialFilterState,
}: {
  lines: readonly LogLine[];
  initialFilter?: FilterState;
}) {
  const [filterState, dispatch] = useReducer(filterReducer, initialFilter);
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const linesById = useMemo(() => {
    const m = new Map<string, LogLine>();
    for (const l of lines) m.set(l.id, l);
    return m;
  }, [lines]);

  const linesIndexById = useMemo(() => {
    const m = new Map<string, number>();
    lines.forEach((l, i) => m.set(l.id, i));
    return m;
  }, [lines]);

  const {
    openContexts,
    toggleContext,
    expandMostRecentContext,
    closeMostRecentContext,
    closeAllContexts,
    selectedContextLineIds,
    expandPulseKey,
    closePulseKey,
  } = useContextWindows({
    lines,
    linesById,
    linesIndexById,
    filterState,
    scenarios: SCENARIOS,
  });

  const derivedLines = useMemo(
    () => deriveLines(lines, filterState, openContexts),
    [lines, filterState, openContexts],
  );

  const visibleLines = useMemo(
    () => derivedLines.filter((l) => l.isVisible),
    [derivedLines],
  );

  /*
   * Keyboard navigation hops between actionable rows only — dimmed
   * lines are visible context but offer no toggle target, so skipping
   * them keeps j/k feeling quick.
   */
  const navigableLines = useMemo(
    () => visibleLines.filter((l) => !l.isDimmed),
    [visibleLines],
  );

  /*
   * Keep keyboard focus on a navigable line. When a filter change drops
   * the focused line from the navigable set, remap to the nearest
   * remaining line by original position so j/k resumes in place rather
   * than snapping to an end. Reconciled during render so it lands in the
   * same commit as the change that removed the line.
   */
  if (focusedLineId && !navigableLines.some((l) => l.id === focusedLineId)) {
    if (navigableLines.length === 0) {
      setFocusedLineId(null);
    } else {
      const target = linesIndexById.get(focusedLineId) ?? 0;
      let nearestId = navigableLines[0].id;
      let nearestDist = Infinity;
      for (const l of navigableLines) {
        const dist = Math.abs((linesIndexById.get(l.id) ?? 0) - target);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestId = l.id;
        }
      }
      setFocusedLineId(nearestId);
    }
  }

  /*
   * Anchor-cycling: from the focused anchor, move to the next or
   * previous anchor in openContexts order, wrapping at the ends. When
   * the focus isn't on any anchor, the next-anchor binding lands on
   * the first anchor and the previous-anchor binding lands on the
   * last. No-op when no contexts are open.
   */
  const navigateNextAnchor = useCallback(() => {
    if (openContexts.length === 0) return;
    const currentIdx = focusedLineId
      ? openContexts.findIndex((c) => c.selectedLineId === focusedLineId)
      : -1;
    const nextIdx =
      currentIdx === -1 ? 0 : (currentIdx + 1) % openContexts.length;
    setFocusedLineId(openContexts[nextIdx].selectedLineId);
  }, [openContexts, focusedLineId]);

  const navigatePrevAnchor = useCallback(() => {
    if (openContexts.length === 0) return;
    const currentIdx = focusedLineId
      ? openContexts.findIndex((c) => c.selectedLineId === focusedLineId)
      : -1;
    const prevIdx =
      currentIdx === -1
        ? openContexts.length - 1
        : (currentIdx - 1 + openContexts.length) % openContexts.length;
    setFocusedLineId(openContexts[prevIdx].selectedLineId);
  }, [openContexts, focusedLineId]);

  const handleKeyDown = useListboxKeyboard({
    lines: navigableLines,
    focusedLineId,
    setFocusedLineId,
    onToggleContext: toggleContext,
    onExpandContext: expandMostRecentContext,
    onNextAnchor: navigateNextAnchor,
    onPrevAnchor: navigatePrevAnchor,
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

  /*
   * Keep the focused line in view after either the focus changes or a
   * context window opens. Runs synchronously before paint so we beat
   * the browser's scroll anchoring, which can otherwise pick an
   * arbitrary visible element to pin and let the anchor drift
   * off-screen when context lines are inserted above it.
   */
  useLayoutEffect(() => {
    if (!focusedLineId) return;
    document
      .getElementById(lineDomId(focusedLineId))
      ?.scrollIntoView({ block: "nearest" });
  }, [focusedLineId, openContexts]);

  /*
   * Document-level keyboard handler, registered in the capture phase so
   * it runs before an enclosing dialog's Esc-to-dismiss — pressing Esc
   * closes an open context or clears a filter before it can close a
   * surrounding overlay. Defers to the shortcut sheet, which owns Esc
   * while it's open, and ignores editable targets so inputs keep their
   * own key semantics.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (sheetOpen) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // `?` is Shift+/ on most layouts; match the produced character.
      if (event.key === "?") {
        event.preventDefault();
        setSheetOpen(true);
        return;
      }

      if (event.key !== "Escape") return;

      if (event.shiftKey) {
        if (openContexts.length > 0) {
          event.preventDefault();
          closeAllContexts();
        }
        return;
      }

      if (openContexts.length > 0) {
        event.preventDefault();
        closeMostRecentContext();
      } else if (hasAnyFilter(filterState)) {
        event.preventDefault();
        dispatch({ type: "clear" });
      }
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [
    sheetOpen,
    openContexts.length,
    closeAllContexts,
    closeMostRecentContext,
    filterState,
    dispatch,
  ]);

  /*
   * Translate app state into Legend entries. Each entry is gated on
   * whether its action is currently meaningful — the toolbar should
   * never advertise a binding that wouldn't do anything if pressed.
   */
  const legendItems = useMemo<readonly LegendItem[]>(() => {
    const items: LegendItem[] = [];

    const mostRecent = openContexts[openContexts.length - 1];
    if (mostRecent) {
      const anchorIdx = linesIndexById.get(mostRecent.selectedLineId);
      // Skip the Expand entry if the anchor is unknown or at the file
      // boundary — a missing anchor is a no-op here, not a render crash.
      if (
        anchorIdx !== undefined &&
        !isAtFileBoundary(anchorIdx, mostRecent.range, lines.length)
      ) {
        items.push({
          keys: SHORTCUTS.expandContext.keys,
          label: "Expand",
          ariaLabel: "Expand the most recent context window",
          onClick: expandMostRecentContext,
          pulseKey: expandPulseKey,
        });
      }
    }

    if (focusedLineId) {
      const focusedIsAnchor = selectedContextLineIds.has(focusedLineId);
      const focusedLine = visibleLines.find((l) => l.id === focusedLineId);
      const focusedCanToggle =
        hasAnyFilter(filterState) &&
        focusedLine !== undefined &&
        focusedLine.isVisible &&
        !focusedLine.isDimmed;

      if (focusedCanToggle || focusedIsAnchor) {
        items.push({
          keys: SHORTCUTS.toggleContext.keys,
          label: focusedIsAnchor ? "Hide" : "View",
          ariaLabel: focusedIsAnchor
            ? "Hide context on focused line"
            : "View context on focused line",
          onClick: () => toggleContext(focusedLineId),
        });
      }
    }

    if (openContexts.length > 0) {
      items.push({
        keys: SHORTCUTS.closeRecent.keys,
        label: "Close",
        ariaLabel: "Close the most recent context",
        onClick: closeMostRecentContext,
        pulseKey: closePulseKey,
      });
    } else if (hasAnyFilter(filterState)) {
      items.push({
        keys: SHORTCUTS.closeRecent.keys,
        label: "Clear",
        ariaLabel: "Clear active filters",
        onClick: () => dispatch({ type: "clear" }),
      });
    }

    // Fallback: keep the toolbar visible with a pointer to the full
    // shortcut sheet whenever nothing else is contextually relevant.
    if (items.length === 0) {
      items.push({
        keys: SHORTCUTS.openShortcuts.keys,
        label: "shortcuts",
        ariaLabel: "Show keyboard shortcuts",
        onClick: () => setSheetOpen(true),
      });
    }

    return items;
  }, [
    openContexts,
    linesIndexById,
    lines.length,
    expandMostRecentContext,
    expandPulseKey,
    closeMostRecentContext,
    closePulseKey,
    focusedLineId,
    selectedContextLineIds,
    visibleLines,
    filterState,
    toggleContext,
  ]);

  return (
    <div className={styles.root} data-logx-surface>
      <div className={styles.toolbar}>
        <Legend items={legendItems} />
        <ScenarioChips state={filterState} dispatch={dispatch} />
      </div>
      <LogList
        lines={visibleLines}
        focusedLineId={focusedLineId}
        selectedContextLineIds={selectedContextLineIds}
        hasAnyFilter={hasAnyFilter(filterState)}
        onKeyDown={handleKeyDown}
        onLineFocus={setFocusedLineId}
        onToggleContext={toggleContext}
        viewportRef={viewportRef}
      />
      <ShortcutSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
