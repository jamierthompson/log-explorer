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
      <span className={styles.instance}>{line.instance}</span>
      <span className={styles.level} data-level={line.level}>
        {line.level}
      </span>
      <span className={styles.message}>{line.message}</span>
    </div>
  );
}
