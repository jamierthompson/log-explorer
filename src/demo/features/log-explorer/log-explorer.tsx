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
import { formatStreamStart } from "@/demo/lib/format-timestamp";
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
import { deriveSnapshot, type LogExplorerSnapshot } from "./log-explorer-state";
import { LogList, lineDomId } from "./log-list";
import { useContextWindows } from "./use-context-windows";
import { useListboxKeyboard } from "./use-listbox-keyboard";

export function LogExplorer({
  lines,
  service,
  initialFilter = initialFilterState,
  onStateChange,
  onViewContext,
  showLegend = true,
}: {
  lines: readonly LogLine[];
  /** Name of the service emitting the stream, shown in the list header. */
  service?: string;
  initialFilter?: FilterState;
  onStateChange?: (snapshot: LogExplorerSnapshot) => void;
  onViewContext?: (lineId: string) => void;
  showLegend?: boolean;
}) {
  const [filterState, dispatch] = useReducer(filterReducer, initialFilter);
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

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

  /*
   * When onViewContext is provided, the explorer delegates the context
   * action to the host instead of opening context in place — letting the
   * host present it its own way. Without it, the action toggles context
   * in place as usual.
   */
  const handleViewContext = useCallback(
    (lineId: string) => {
      if (onViewContext) onViewContext(lineId);
      else toggleContext(lineId);
    },
    [onViewContext, toggleContext],
  );

  const derivedLines = useMemo(
    () => deriveLines(lines, filterState, openContexts),
    [lines, filterState, openContexts],
  );

  const visibleLines = useMemo(
    () => derivedLines.filter((l) => l.isVisible),
    [derivedLines],
  );

  /*
   * Stream header: where the stream starts plus how much of it is
   * showing. The count names the full stream when everything is
   * visible and the narrowed share once filtering or context windows
   * hide lines — making the collapse legible at a glance.
   */
  const header = useMemo(() => {
    if (lines.length === 0) return undefined;
    const count =
      visibleLines.length === lines.length
        ? `${lines.length} lines`
        : `${visibleLines.length} of ${lines.length} lines`;
    return [service, formatStreamStart(lines[0].timestamp), count]
      .filter(Boolean)
      .join(" · ");
  }, [lines, service, visibleLines.length]);

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
    onToggleContext: handleViewContext,
    onExpandContext: expandMostRecentContext,
    onNextAnchor: navigateNextAnchor,
    onPrevAnchor: navigatePrevAnchor,
  });

  /*
   * Land at the newest line, matching how tail-style log viewers open.
   * When visible at mount useLayoutEffect runs before
   * paint, so the unscrolled position never flashes. A host may instead
   * mount the explorer hidden and reveal it later;
   * a zero-height viewport can't scroll, so wait for it to gain
   * height, then land at the bottom once.
   */
  useLayoutEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    const toBottom = () => {
      v.scrollTop = v.scrollHeight;
    };
    if (v.clientHeight > 0) {
      toBottom();
      return;
    }
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (v.clientHeight > 0) {
        toBottom();
        observer.disconnect();
      }
    });
    observer.observe(v);
    return () => observer.disconnect();
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
   * surrounding overlay. Being global, it must also know when keys
   * aren't meant for this explorer: while a hidden ancestor conceals it
   * (a host may keep several explorers mounted and reveal one at a
   * time), while a modal that doesn't contain it holds focus (those
   * keys belong to that layer — Esc must dismiss it, not mutate state
   * behind it), while the shortcut sheet is open (the sheet owns Esc),
   * and when the target is editable (inputs keep their own key
   * semantics).
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const root = rootRef.current;
      if (!root || root.closest("[hidden]")) return;

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

      /*
       * The explorer's own sheet was ruled out above, so any dialog
       * enclosing the target that doesn't also enclose this explorer
       * is a foreign modal layer.
       */
      const dialog = target?.closest('[role="dialog"]');
      if (dialog && !dialog.contains(root)) return;

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
          ariaLabel: "Expand the most recent context",
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
            ? "Hide context on the focused line"
            : "View context on the focused line",
          onClick: () => handleViewContext(focusedLineId),
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
        ariaLabel: "Clear the filter",
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
    handleViewContext,
  ]);

  /*
   * Report a curated snapshot of investigation progress to the host so a
   * surrounding experience can react without reaching into the explorer's
   * internals.
   */
  const snapshot = useMemo(
    () => deriveSnapshot(filterState, openContexts, SCENARIOS),
    [filterState, openContexts],
  );
  useEffect(() => {
    onStateChange?.(snapshot);
  }, [snapshot, onStateChange]);

  return (
    <div ref={rootRef} className={styles.root} data-logx-surface>
      <div className={styles.toolbar}>
        <ScenarioChips state={filterState} dispatch={dispatch} />
        {showLegend && <Legend items={legendItems} />}
      </div>
      <LogList
        lines={visibleLines}
        header={header}
        focusedLineId={focusedLineId}
        selectedContextLineIds={selectedContextLineIds}
        hasAnyFilter={hasAnyFilter(filterState)}
        onKeyDown={handleKeyDown}
        onLineFocus={setFocusedLineId}
        onToggleContext={handleViewContext}
        viewportRef={viewportRef}
      />
      <ShortcutSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
