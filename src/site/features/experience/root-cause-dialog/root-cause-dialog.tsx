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
  /** Verdict prose, one entry per paragraph. */
  readonly outcome: readonly string[];
};

const CAUSES: readonly Cause[] = [
  {
    id: "db-down",
    name: "The database is down",
    detail: "Postgres fell over and every instance is failing.",
    outcome: [
      "Worth another look — @m7w3p and @t2x8r kept serving 200s through the whole incident, and checkout itself succeeded on @m7w3p at 13:31:55. A database that was truly down wouldn't spare two of three instances.",
    ],
  },
  {
    id: "payload",
    name: "A malformed checkout payload",
    detail: "Bad client input crashed the request.",
    outcome: [
      "Follow the trace once more: the request was accepted, then sat waiting on a database connection until it timed out — it never reached validation. And the same instance failed an unrelated add-to-cart the same way; bad input doesn't spread between requests.",
    ],
  },
  {
    id: "pool",
    name: "A config reload shrank @kc4qn's DB pool",
    detail: "db.pool.max dropped 20 → 5, starving connections.",
    correct: true,
    outcome: [
      "At 13:30:11 a hot-reload set db.pool.max from 20 to 5 on @kc4qn alone; within a minute the pool was saturated and every request on it — r4d8a2 included — timed out waiting for a connection. The reload carried no request id, so the trace could never show it.",
      "Opening context in place, with your filter intact, put it one line from the failure instead of one tab away. The cause was never in the trace; it was in the line beside it.",
    ],
  },
];

export function RootCauseDialog({
  open,
  onOpenChange,
  onReplay,
  onReadStory,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplay?: () => void;
  onReadStory?: () => void;
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
              {picked.outcome.map((paragraph) => (
                <p key={paragraph} className={styles.lesson}>
                  {paragraph}
                </p>
              ))}
              {/* Dismissal is handled by the overlay and Esc, so the only
                  buttons here advance: on the closing bookend, onward to the
                  build story or another run; after a miss, a retry. */}
              {(onReadStory || onReplay || !picked.correct) && (
                <div className={styles.actions}>
                  {picked.correct ? (
                    <>
                      {onReadStory && (
                        <Button variant="primary" onClick={onReadStory}>
                          Read how it was built
                        </Button>
                      )}
                      {onReplay && (
                        <Button variant="ghost" onClick={onReplay}>
                          Replay the incident
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      className={styles.wide}
                      onClick={() => setPicked(null)}
                    >
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
