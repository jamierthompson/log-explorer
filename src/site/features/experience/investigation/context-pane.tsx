import {
  DEFAULT_CONTEXT_RANGE,
  formatLogTime,
  LogRow,
  type LogLine,
} from "@/demo";

import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import { AddressBar } from "./address-bar";
import styles from "./context-pane.module.css";

/** A fake permalink for the slice's anchor line, so the tab carries an
 * address bar like the separate page it pretends to be. */
function sliceUrl(service: string, anchor: LogLine): string {
  const path = `logs.example.com/${service}/${anchor.instance}/${formatLogTime(anchor.timestamp)}`;
  return anchor.requestId ? `${path}?req=${anchor.requestId}` : path;
}

/**
 * A act-one context slice: the window of lines around an anchored row,
 * rendered unfiltered in its own tab. A read-only echo of the live tail's
 * rows, so a torn-out scrap reads identically to the stream it came from.
 */
export function ContextPane({
  lines,
  anchorId,
  service,
}: {
  lines: readonly LogLine[];
  anchorId: string;
  service: string;
}) {
  const index = lines.findIndex((l) => l.id === anchorId);
  const anchor = index === -1 ? null : lines[index];
  const slice =
    index === -1
      ? []
      : lines.slice(
          Math.max(0, index - DEFAULT_CONTEXT_RANGE),
          index + DEFAULT_CONTEXT_RANGE + 1,
        );

  return (
    <div className={styles.pane}>
      {/* The slice is a whole separate page, one tab away — so it carries
          its own address bar, then a page header that says what the window
          is before the lines below it. */}
      {anchor && (
        <>
          <AddressBar url={sliceUrl(service, anchor)} />
          <header className={styles.header}>
            <p className={styles.headerTitle}>
              Context around{" "}
              <span className={styles.headerSubject}>{anchor.message}</span>
            </p>
            <p className={styles.headerMeta}>
              {formatLogTime(slice[0].timestamp)} –{" "}
              {formatLogTime(slice[slice.length - 1].timestamp)} ·{" "}
              {slice.length} lines
            </p>
          </header>
        </>
      )}

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
