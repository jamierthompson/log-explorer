"use client";

import { useState } from "react";

import { Button } from "@/site/ui/button/button";
import { Kicker } from "@/site/ui/kicker/kicker";

import { CAUSES, CORRECT_CAUSE_ID, type Cause } from "./causes";
import styles from "./root-cause-panel.module.css";

/**
 * The root-cause call's body: the choices on the left, the verdict on the
 * right (below on mobile). The choices stay put and the picked one stays
 * lit while its verdict shows, so a miss is corrected by picking again
 * rather than backing out of a swapped view.
 */
export function RootCausePanel({
  onReplay,
  onReadStory,
}: {
  onReplay?: () => void;
  onReadStory?: () => void;
}) {
  const [picked, setPicked] = useState<Cause | null>(null);
  const isCorrect = picked?.id === CORRECT_CAUSE_ID;

  return (
    <div className={styles.columns}>
      <ol className={styles.choices}>
        {CAUSES.map((cause, i) => (
          <li key={cause.id}>
            <button
              type="button"
              className={styles.choice}
              aria-pressed={picked?.id === cause.id}
              onClick={() => setPicked(cause)}
            >
              <span className={styles.choiceNumber} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={styles.choiceText}>
                <span className={styles.choiceName}>{cause.name}</span>
                <span className={styles.choiceDetail}>{cause.detail}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* Announce the verdict politely instead of moving focus, so the
          choices stay where the visitor left them. */}
      <aside className={styles.verdict} aria-live="polite">
        <Kicker tone="accent">
          {picked
            ? isCorrect
              ? "Root cause found"
              : "Keep looking"
            : "The verdict"}
        </Kicker>
        {picked ? (
          <div className={styles.result}>
            <p className={styles.lesson}>
              <span className={styles.lead}>{picked.lead}</span> {picked.rest}
            </p>
            {/* Only the right call earns the way onward; a miss just invites
                another pick from the choices still beside it. */}
            {isCorrect && (onReadStory || onReplay) && (
              <div className={styles.actions}>
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
              </div>
            )}
          </div>
        ) : (
          <p className={styles.placeholder}>Pick a cause to see the verdict.</p>
        )}
      </aside>
    </div>
  );
}
