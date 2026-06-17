"use client";

import { Circle, CircleCheck, RotateCcw } from "lucide-react";
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

export function GuideBox({
  title,
  items,
  action,
  onAnnounce,
  onReset,
}: {
  title: string;
  items: readonly GuideItem[];
  action?: GuideAction;
  onAnnounce?: (message: string) => void;
  onReset?: () => void;
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
      <div className={styles.head}>
        <p className={styles.title}>{title}</p>
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            className={styles.reset}
            aria-label="Reset the investigation"
            title="Reset the investigation"
            onClick={onReset}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </Button>
        )}
      </div>
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
    </aside>
  );
}
