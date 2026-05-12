"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { LogLine as LogLineType } from "@/types/log";

import { LogLine } from "./log-line";
import styles from "./log-list.module.css";

const lineDomId = (lineId: string) => `line_${lineId}`;

export function LogList({
  lines,
  focusedLineId,
  onKeyDown,
}: {
  lines: readonly LogLineType[];
  focusedLineId: string | null;
  onKeyDown: (event: ReactKeyboardEvent<HTMLUListElement>) => void;
}) {
  return (
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
  );
}
