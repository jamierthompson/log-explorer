import { Circle, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

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
  readonly disabled?: boolean;
};

/**
 * The act's side guide — a titled checklist whose items fill with the
 * accent as they complete, with an optional action and a closing note.
 */
export function GuideBox({
  title,
  items,
  action,
  note,
}: {
  title: string;
  items: readonly GuideItem[];
  action?: GuideAction;
  note?: ReactNode;
}) {
  return (
    <aside className={styles.guide} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <ul className={styles.steps}>
        {items.map((item) => (
          <li
            key={item.id}
            className={styles.step}
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
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      )}
      {note && <p className={styles.note}>{note}</p>}
    </aside>
  );
}
