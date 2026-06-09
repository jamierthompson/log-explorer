"use client";

import { useState } from "react";

import { LogExplorer, type LogLine } from "@/demo";

import { ActHeader } from "./act-header/act-header";
import { ActOne } from "./act-one/act-one";
import styles from "./experience.module.css";
import { GuideBox, type GuideItem } from "./guide-box/guide-box";
import { RootCauseDialog } from "./root-cause-dialog/root-cause-dialog";
import { useActs } from "./use-acts";

const ACT2_ITEMS: readonly GuideItem[] = [
  {
    id: "narrow",
    title: "Narrow to the failure",
    description: "Filter the live tail to the one request that failed.",
  },
  {
    id: "context",
    title: "Open context in place",
    description: "Click a line to expand the rows around it — filter intact.",
  },
  {
    id: "stack",
    title: "Stack a second context",
    description: "Open another without losing the first or your position.",
  },
  {
    id: "cause",
    title: "Call the root cause",
    description: "Name what broke, once the picture is clear.",
  },
];

/**
 * The guided demo experience. Owns act sequencing and narration, and
 * hosts the explorer; the surrounding stage is the host's concern. Act 1
 * runs the explorer with context delegated to tabs (the old way); Act 2
 * is the explorer with context-in-place and the Legend. Each act pairs
 * its body with a side guide.
 */
export function Experience({ lines }: { lines: readonly LogLine[] }) {
  const { act, advance } = useActs();
  const [rootCauseOpen, setRootCauseOpen] = useState(false);

  return (
    <div className={styles.experience}>
      {act === "act1" ? (
        <ActOne lines={lines} onAdvance={advance} />
      ) : (
        <>
          <ActHeader
            step="Act 2"
            kicker="In place"
            title="The same investigation, kept in one view"
            lead="Open context where the line lives. The filter holds, your position holds, and every view stacks in the same window."
          />
          <div className={styles.layout}>
            <div className={styles.aside}>
              <GuideBox
                title="The Method"
                items={ACT2_ITEMS}
                action={{
                  label: "Call the root cause",
                  onClick: () => setRootCauseOpen(true),
                }}
                note="The filter holds and your place holds — make the call when the picture is clear."
              />
            </div>
            <div className={styles.main}>
              <LogExplorer lines={lines} />
            </div>
          </div>
          <RootCauseDialog
            open={rootCauseOpen}
            onOpenChange={setRootCauseOpen}
          />
        </>
      )}
    </div>
  );
}
