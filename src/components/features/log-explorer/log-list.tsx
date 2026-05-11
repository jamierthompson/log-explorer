import type { LogLine as LogLineType } from "@/types/log";

import { LogLine } from "./log-line";
import styles from "./log-list.module.css";

export function LogList({ lines }: { lines: readonly LogLineType[] }) {
  return (
    <ul className={styles.list}>
      {lines.map((line) => (
        <li key={line.id}>
          <LogLine line={line} />
        </li>
      ))}
    </ul>
  );
}
