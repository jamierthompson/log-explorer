"use client";

import { useCallback, useState } from "react";

import { Button } from "@/site/ui/button/button";

import { CAUSES, CORRECT_CAUSE_ID, type Cause } from "./causes";
import styles from "./root-cause-panel.module.css";

/**
 * The root-cause call's content, free of page chrome so the route can frame
 * it. The live heading swaps between the question and the verdict, so the
 * heading element is what names the surface as the outcome changes.
 *
 * Choices render from CAUSES and selection routes through one handler, so
 * per-choice behavior stays local to this component.
 */
export function RootCausePanel({
  onReplay,
  onReadStory,
}: {
  onReplay?: () => void;
  onReadStory?: () => void;
}) {
  const [picked, setPicked] = useState<Cause | null>(null);

  // Move focus to the verdict when it swaps in, so assistive tech reads the
  // outcome rather than leaving focus on the choice that just unmounted.
  const focusVerdict = useCallback((node: HTMLElement | null) => {
    node?.focus();
  }, []);

  const reconsider = useCallback(() => setPicked(null), []);

  if (picked) {
    const isCorrect = picked.id === CORRECT_CAUSE_ID;
    return (
      <div className={styles.result} data-correct={isCorrect || undefined}>
        <h2 ref={focusVerdict} tabIndex={-1} className={styles.eyebrow}>
          {isCorrect ? "Root cause found" : "Keep looking"}
        </h2>
        <p className={styles.resultName}>{picked.name}</p>
        {picked.outcome.map((paragraph, i) => (
          <p key={i} className={styles.lesson}>
            {paragraph}
          </p>
        ))}
        {/* The closing verdict offers the way onward; a miss offers a retry. */}
        {(onReadStory || onReplay || !isCorrect) && (
          <div className={styles.actions}>
            {isCorrect ? (
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
                onClick={reconsider}
              >
                Reconsider
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <h2 className={styles.title}>What was the root cause?</h2>
      <p className={styles.description}>
        You’ve followed the failing request through its context. Make the call.
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
  );
}
