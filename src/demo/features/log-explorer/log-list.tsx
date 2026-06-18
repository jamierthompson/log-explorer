"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Fragment } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  Ref,
} from "react";

import type { DerivedLogLine } from "@/demo/types/log";

import { LogLine } from "./log-line";
import styles from "./log-list.module.css";

/** DOM id for a log-line row. Exported so callers that need to focus
 * or scroll to a specific line can use the same value the list
 * renders. */
export const lineDomId = (lineId: string) => `line_${lineId}`;

/** A collapsed stretch of the stream: a quiet rule with the hidden-line
 * count, so the visible rows read as discrete slices torn from a longer
 * feed. Presentational — it isn't a listbox option. */
function GapRow({ count }: { count: number }) {
  return (
    <li role="presentation" aria-hidden="true" className={styles.gap}>
      <span className={styles.gapLabel}>
        {count} {count === 1 ? "line" : "lines"} hidden
      </span>
    </li>
  );
}

export function LogList({
  lines,
  totalLines,
  header,
  focusedLineId,
  selectedContextLineIds,
  hasAnyFilter,
  onKeyDown,
  onLineFocus,
  onToggleContext,
  viewportRef,
}: {
  lines: readonly DerivedLogLine[];
  /** Length of the full stream, so collapsed stretches at the head and
   * tail of the visible set can be counted. */
  totalLines: number;
  /** One-line description of the stream and how much of it is showing. */
  header?: string;
  focusedLineId: string | null;
  selectedContextLineIds: ReadonlySet<string>;
  hasAnyFilter: boolean;
  onKeyDown: (event: ReactKeyboardEvent<HTMLUListElement>) => void;
  onLineFocus: (lineId: string) => void;
  onToggleContext: (lineId: string) => void;
  viewportRef?: Ref<HTMLDivElement>;
}) {
  // Hidden runs at the head and tail of the visible set — the stream
  // collapsed above the first row and below the last.
  const leadingHidden = lines.length > 0 ? lines[0].index : 0;
  const trailingHidden =
    lines.length > 0 ? totalLines - 1 - lines[lines.length - 1].index : 0;
  const handleClick = (
    line: DerivedLogLine,
    isSelected: boolean,
    canToggle: boolean,
    event: ReactMouseEvent<HTMLLIElement>,
  ) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    onLineFocus(line.id);
    if (isSelected || canToggle) {
      onToggleContext(line.id);
    }
  };

  return (
    <div className={styles.wrap}>
      {header && (
        <div className={styles.dayMarker}>
          <span className={styles.dayMarkerLabel}>{header}</span>
        </div>
      )}
      <ScrollArea.Root className={styles.scrollRoot} type="always">
        <ScrollArea.Viewport
          ref={viewportRef}
          className={styles.scrollViewport}
        >
          <ul
            className={styles.list}
            role="listbox"
            tabIndex={0}
            aria-label="Log lines"
            aria-multiselectable="true"
            aria-activedescendant={
              focusedLineId ? lineDomId(focusedLineId) : undefined
            }
            onKeyDown={onKeyDown}
          >
            {leadingHidden > 0 && <GapRow count={leadingHidden} />}
            {lines.map((line, i) => {
              const isFocused = line.id === focusedLineId;
              const isSelected = selectedContextLineIds.has(line.id);
              const canToggle =
                hasAnyFilter && line.isVisible && !line.isDimmed;
              const isClickable = isSelected || canToggle;
              // Lines hidden between this visible row and the previous one —
              // a collapsed stretch of the stream the filter or context gaps
              // skip over. Marked so the slices read as discrete windows.
              const prev = i > 0 ? lines[i - 1] : null;
              const hiddenBefore = prev ? line.index - prev.index - 1 : 0;
              return (
                <Fragment key={line.id}>
                  {hiddenBefore > 0 && <GapRow count={hiddenBefore} />}
                  <li
                    id={lineDomId(line.id)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={!isClickable || undefined}
                    data-focused={isFocused || undefined}
                    data-selected={isSelected || undefined}
                    data-context={line.inContext || undefined}
                    data-dimmed={line.isDimmed || undefined}
                    data-clickable={isClickable || undefined}
                    onClick={(e) => handleClick(line, isSelected, canToggle, e)}
                  >
                    <LogLine line={line} />
                  </li>
                </Fragment>
              );
            })}
            {trailingHidden > 0 && <GapRow count={trailingHidden} />}
          </ul>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className={styles.scrollbar}
        >
          <ScrollArea.Thumb className={styles.scrollbarThumb} />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </div>
  );
}
