"use client";

import { LogExplorer, type LogLine } from "@/demo";

import { ActOne } from "./act-one/act-one";
import styles from "./experience.module.css";
import { useActs } from "./use-acts";

/**
 * The guided demo experience. Owns act sequencing and hosts the explorer;
 * the surrounding stage is the host's concern. Act 1 runs the explorer
 * with context delegated to tabs (the old way); Act 2 is the explorer
 * with context-in-place and the Legend.
 */
export function Experience({ lines }: { lines: readonly LogLine[] }) {
  const { act, advance } = useActs();

  return (
    <div className={styles.experience}>
      {act === "act1" ? (
        <ActOne lines={lines} onAdvance={advance} />
      ) : (
        <LogExplorer lines={lines} />
      )}
    </div>
  );
}
