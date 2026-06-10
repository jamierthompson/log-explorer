"use client";

import { Circle, CircleCheck } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/site/ui/button/button";

import styles from "./guide-box.module.css";

export type GuideItem = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly done?: boolean;
};

export type GuideAction = {
  readonly label: ReactNode;
  readonly onClick: () => void;
};

/**
 * The act's side guide — a titled checklist whose items fill with the
 * accent as they complete, with an optional closing action and an
 * optional footer line beneath it for state-reactive narration.
 * Completions are reported through onAnnounce so a live region elsewhere
 * can voice them.
 */
export function GuideBox({
  title,
  items,
  action,
  foot,
  onAnnounce,
}: {
  title: string;
  items: readonly GuideItem[];
  action?: GuideAction;
  foot?: ReactNode;
  onAnnounce?: (message: string) => void;
}) {
  /*
   * Announce only done-state transitions: the first render is a
   * baseline, so steps that mount already-done stay silent instead of
   * replaying their completion on every remount.
   */
  const prevDone = useRef<ReadonlyMap<string, boolean> | null>(null);
  useEffect(() => {
    const done = new Map(items.map((item) => [item.id, Boolean(item.done)]));
    const prev = prevDone.current;
    prevDone.current = done;
    if (!prev || !onAnnounce) return;
    for (const item of items) {
      if (item.done && prev.get(item.id) === false) {
        onAnnounce(`Step done: ${item.title}`);
      }
    }
  }, [items, onAnnounce]);

  return (
    <aside className={styles.guide} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <ul className={styles.steps}>
        {items.map((item) => (
          <li
            key={item.id}
            className={styles.step}
            data-guide-step={item.id}
            data-done={item.done || undefined}
          >
            {item.done ? (
              <CircleCheck className={styles.checkDone} aria-hidden="true" />
            ) : (
              <Circle className={styles.checkTodo} aria-hidden="true" />
            )}
            <div className={styles.body}>
              <span className={styles.srStatus}>
                {item.done ? "Done: " : "To do: "}
              </span>
              <span className={styles.stepTitle}>{item.title}</span>
              {item.description && (
                <span className={styles.stepDesc}>{item.description}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {action && (
        <Button
          variant="primary"
          className={styles.action}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      {foot && <p className={styles.foot}>{foot}</p>}
    </aside>
  );
}
