"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { Button } from "@/site/ui/button/button";

import styles from "./root-cause-dialog.module.css";

type Cause = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly correct?: boolean;
  readonly outcome: string;
};

const CAUSES: readonly Cause[] = [
  {
    id: "db-down",
    name: "The database is down",
    detail: "Postgres fell over and every instance is failing.",
    outcome:
      "Worth another look — @m7w3p and @t2x8r kept serving 200s right through the incident. A database that was truly down wouldn't spare two of three instances.",
  },
  {
    id: "payload",
    name: "A malformed checkout payload",
    detail: "Bad client input crashed the request.",
    outcome:
      "Follow the trace once more: the request was accepted, then sat waiting on a database connection until it timed out — it never reached validation.",
  },
  {
    id: "pool",
    name: "A config reload shrank @kc4qn's DB pool",
    detail: "db.pool.max dropped 20 → 5, starving connections.",
    correct: true,
    outcome:
      "The trace tells you where checkout broke — a pool timeout — but not why. The cause carried no request id, so it never entered the trace. Opening context in place, with your filter intact, put the config reload one line from the failure instead of one tab away. The work of narrowing in followed you to where you looked.",
  },
];

export function RootCauseDialog({
  open,
  onOpenChange,
  onReplay,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplay?: () => void;
}) {
  const [picked, setPicked] = useState<Cause | null>(null);

  // Clear the verdict on close so the next call starts fresh.
  const handleOpenChange = (next: boolean) => {
    if (!next) setPicked(null);
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          {picked ? (
            <div
              className={styles.result}
              data-correct={picked.correct || undefined}
            >
              <Dialog.Title className={styles.eyebrow}>
                {picked.correct ? "Root cause found" : "Keep looking"}
              </Dialog.Title>
              <p className={styles.resultName}>{picked.name}</p>
              <p className={styles.lesson}>{picked.outcome}</p>
              {/* Dismissal is handled by the overlay and Esc, so the only
                  buttons here advance: replay on the closing bookend, or a
                  retry after a miss. */}
              {(onReplay || !picked.correct) && (
                <div className={styles.actions}>
                  {picked.correct ? (
                    <Button variant="primary" onClick={onReplay}>
                      Replay the incident
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => setPicked(null)}>
                      Reconsider
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <Dialog.Title className={styles.title}>
                What was the root cause?
              </Dialog.Title>
              <p className={styles.description}>
                You&rsquo;ve followed the failing request through its context.
                Make the call.
              </p>
              <div className={styles.choices}>
                {CAUSES.map((cause) => (
                  <button
                    key={cause.id}
                    type="button"
                    className={styles.choice}
                    onClick={() => setPicked(cause)}
                  >
                    <span className={styles.choiceName}>{cause.name}</span>
                    <span className={styles.choiceDetail}>{cause.detail}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
