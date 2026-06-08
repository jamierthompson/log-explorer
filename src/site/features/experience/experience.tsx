"use client";

import { LogExplorer, type LogLine } from "@/demo";

import { ActHeader } from "./act-header/act-header";
import { ActOne } from "./act-one/act-one";
import styles from "./experience.module.css";
import { useActs } from "./use-acts";

/**
 * The guided demo experience. Owns act sequencing and narration, and
 * hosts the explorer; the surrounding stage is the host's concern. Act 1
 * runs the explorer with context delegated to tabs (the old way); Act 2
 * is the explorer with context-in-place and the Legend.
 */
export function Experience({ lines }: { lines: readonly LogLine[] }) {
  const { act, advance } = useActs();

  return (
    <div className={styles.experience}>
      {act === "act1" ? (
        <>
          <ActHeader
            step="Act 1"
            kicker="The old way"
            title="One failing request, scattered across tabs"
            lead="Filter the live tail to the failing request, then open a line for context — it opens in a new tab that left your filter behind."
          />
          <ActOne lines={lines} onAdvance={advance} />
        </>
      ) : (
        <>
          <ActHeader
            step="Act 2"
            kicker="In place"
            title="The same investigation, kept in one view"
            lead="Open context where the line lives. The filter holds, your position holds, and every view stacks in the same window."
          />
          <LogExplorer lines={lines} />
        </>
      )}
    </div>
  );
}
