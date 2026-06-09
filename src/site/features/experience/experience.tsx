"use client";

import { type LogLine } from "@/demo";

import { ActOne } from "./act-one/act-one";
import { ActTwo } from "./act-two/act-two";
import styles from "./experience.module.css";
import { useActs } from "./use-acts";

/**
 * The guided demo experience. Sequences the two acts and lets the browser
 * back button step between them; each act owns its own narration, guide,
 * and stage. Act 1 is the old way (context scattered into tabs); Act 2 is
 * the method (context in place, ending in the root-cause call).
 *
 * Both acts stay mounted and the inactive one is hidden, so navigating
 * between them preserves each act's progress — filters, open views, guide
 * state, and the explorer's own internal state all survive the round trip.
 */
export function Experience({ lines }: { lines: readonly LogLine[] }) {
  const { act, advance } = useActs();

  return (
    <div className={styles.experience}>
      <div className={styles.act} hidden={act !== "act1"}>
        <ActOne lines={lines} onAdvance={advance} />
      </div>
      <div className={styles.act} hidden={act !== "act2"}>
        <ActTwo lines={lines} />
      </div>
    </div>
  );
}
