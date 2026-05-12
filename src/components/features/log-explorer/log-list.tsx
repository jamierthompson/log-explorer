"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import type { KeyboardEvent as ReactKeyboardEvent, Ref } from "react";

import type { LogLine as LogLineType } from "@/types/log";

import { LogLine } from "./log-line";
import styles from "./log-list.module.css";

const lineDomId = (lineId: string) => `line_${lineId}`;

export function LogList({
  lines,
  focusedLineId,
  onKeyDown,
  viewportRef,
}: {
  lines: readonly LogLineType[];
  focusedLineId: string | null;
  onKeyDown: (event: ReactKeyboardEvent<HTMLUListElement>) => void;
  viewportRef?: Ref<HTMLDivElement>;
}) {
  return (
    <ScrollArea.Root className={styles.scrollRoot} type="hover">
      <ScrollArea.Viewport
        ref={viewportRef}
        className={styles.scrollViewport}
      >
        <ul
          className={styles.list}
          role="listbox"
          tabIndex={0}
          aria-label="Log lines"
          aria-activedescendant={
            focusedLineId ? lineDomId(focusedLineId) : undefined
          }
          onKeyDown={onKeyDown}
        >
          {lines.map((line) => {
            const isFocused = line.id === focusedLineId;
            return (
              <li
                key={line.id}
                id={lineDomId(line.id)}
                role="option"
                aria-selected={isFocused}
                data-focused={isFocused || undefined}
              >
                <LogLine line={line} />
              </li>
            );
          })}
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
  );
}
