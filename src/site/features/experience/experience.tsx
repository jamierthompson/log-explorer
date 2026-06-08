"use client";

import { LogExplorer, type LogLine } from "@/demo";
import { Button } from "@/site/ui/button/button";

import styles from "./experience.module.css";
import { useActs } from "./use-acts";

/**
 * The guided demo experience. Owns act sequencing and hosts the explorer;
 * the surrounding stage is the host's concern.
 */
export function Experience({ lines }: { lines: readonly LogLine[] }) {
  const { act, advance } = useActs();

  return (
    <div className={styles.experience}>
      {act === "act1" ? (
        <div className={styles.placeholder}>
          <p>Act 1 — the old way</p>
          <Button variant="primary" onClick={advance}>
            Continue
          </Button>
        </div>
      ) : (
        <LogExplorer lines={lines} />
      )}
    </div>
  );
}
