"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { Button } from "@/site/ui/button/button";

import styles from "./root-cause-dialog.module.css";

type Cause = {
  readonly id: string;
  readonly label: string;
  readonly correct?: boolean;
};

const CAUSES: readonly Cause[] = [
  {
    id: "pool",
    label: "The upstream connection pool was exhausted",
    correct: true,
  },
  { id: "rate", label: "The service hit an upstream rate limit" },
  { id: "query", label: "A slow database query stalled the request" },
  { id: "cache", label: "A cache stampede hit cold keys" },
];

const FOUND_LESSON =
  "The slow upstream calls held every connection in the pool open; once it drained, new requests had nowhere to go and errored out.";

const MISS_HINT =
  "Look again at what the errors had in common — every failure traces back to the same exhausted resource.";

export function RootCauseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
                {picked.correct ? "Root cause found" : "Not quite"}
              </Dialog.Title>
              <p className={styles.resultName}>{picked.label}</p>
              <p className={styles.lesson}>
                {picked.correct ? FOUND_LESSON : MISS_HINT}
              </p>
              <div className={styles.actions}>
                <Button variant="ghost" onClick={() => setPicked(null)}>
                  Reconsider
                </Button>
                <Dialog.Close asChild>
                  <Button variant="primary">Close</Button>
                </Dialog.Close>
              </div>
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
                    {cause.label}
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
