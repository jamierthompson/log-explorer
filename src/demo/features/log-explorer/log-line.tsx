import { formatTime } from "@/demo/lib/format-timestamp";
import type { LogLine as LogLineType } from "@/demo/types/log";
// The row is exported standalone, so it must carry the tokens its
// styles read rather than relying on the explorer having mounted them.
import "@/demo/styles/base.css";
import "@/demo/styles/tokens.css";

import styles from "./log-line.module.css";

/*
 * The root marks itself as a demo surface so the scoped base reset and
 * color-scheme apply wherever a host composes the row — it can't assume
 * the explorer root (which carries the same marker) is an ancestor.
 * Nesting inside the explorer is harmless: the reset is zero-specificity
 * and idempotent.
 */
export function LogLine({ line }: { line: LogLineType }) {
  return (
    <div className={styles.line} data-logx-surface>
      <time
        className={styles.time}
        dateTime={new Date(line.timestamp).toISOString()}
      >
        {formatTime(line.timestamp)}
      </time>
      <span className={styles.instance}>
        <span className={styles.atSign} aria-hidden="true">
          @
        </span>
        {line.instance}
      </span>
      <span className={styles.message}>
        {line.level !== "INFO" && (
          <>
            <span className={styles.level} data-level={line.level}>
              {line.level}
            </span>{" "}
          </>
        )}
        <span>{line.message}</span>
        {line.requestId && (
          <>
            {" "}
            <span className={styles.requestId}>req={line.requestId}</span>
          </>
        )}
      </span>
    </div>
  );
}
