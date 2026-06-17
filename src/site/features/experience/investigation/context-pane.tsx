import { DEFAULT_CONTEXT_RANGE, LogRow, type LogLine } from "@/demo";

import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import styles from "./context-pane.module.css";

/**
 * A phase-one context slice: the window of lines around an anchored row,
 * rendered unfiltered in its own tab. A read-only echo of the live tail's
 * rows, so a torn-out scrap reads identically to the stream it came from.
 */
export function ContextPane({
  lines,
  anchorId,
}: {
  lines: readonly LogLine[];
  anchorId: string;
}) {
  const index = lines.findIndex((l) => l.id === anchorId);
  const slice =
    index === -1
      ? []
      : lines.slice(
          Math.max(0, index - DEFAULT_CONTEXT_RANGE),
          index + DEFAULT_CONTEXT_RANGE + 1,
        );

  return (
    <div className={styles.pane}>
      {/* A text-only scroller: nothing inside takes focus, so the
       * viewport itself must, or keyboard users can't scroll it. */}
      <ScrollArea focusLabel="Log slice">
        <ul className={styles.paneList}>
          {slice.map((line) => (
            <li
              key={line.id}
              className={styles.paneRow}
              data-anchor={line.id === anchorId || undefined}
              aria-current={line.id === anchorId || undefined}
            >
              <LogRow line={line} />
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
