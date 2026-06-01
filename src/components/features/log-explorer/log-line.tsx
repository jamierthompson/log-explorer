import { formatTime } from "@/lib/format-timestamp";
import type { LogLine as LogLineType } from "@/types/log";

import styles from "./log-line.module.css";

export function LogLine({ line }: { line: LogLineType }) {
  return (
    <div className={styles.line}>
      <time
        className={styles.time}
        dateTime={new Date(line.timestamp).toISOString()}
      >
        {formatTime(line.timestamp)}
      </time>
      <span className={styles.instance}>
        <span className={styles.atSign}>@</span>{line.instance}
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
