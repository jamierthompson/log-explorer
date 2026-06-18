"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/site/ui/button/button";
import { Kicker } from "@/site/ui/kicker/kicker";
import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import styles from "./incident-debrief.module.css";

type Field = { readonly label: string; readonly value: string };

const FIELDS: readonly Field[] = [
  { label: "Surface", value: "api-gateway" },
  { label: "Instance", value: "kc4qn" },
  { label: "Duration", value: "~9 min" },
  { label: "Status", value: "Resolved" },
];

/**
 * The incident debrief — the close of the two acts, surfaced in place over
 * the investigation rather than on a route of its own. A light, narrated
 * sign-off that ties the story together: it names what broke and lands the
 * point the whole demo was built around, that the cause never showed up in
 * the trace. Deliberately short — the detail lives in the logs; this is the
 * payoff and the handoff into the build story. The body scrolls with the
 * shared scrollbar; the actions stay pinned so they're never buried.
 */
export function IncidentDebrief({
  open,
  onOpenChange,
  onReadStory,
  onReplay,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReadStory?: () => void;
  onReplay?: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          {/* Esc still closes; this gives pointer and AT users a visible,
           * labeled way out. */}
          <Dialog.Close className={styles.close} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </Dialog.Close>

          <ScrollArea className={styles.scroll}>
            <div className={styles.scrollInner}>
              <header className={styles.head}>
                <Kicker tone="accent">Incident debrief</Kicker>
                <Dialog.Title className={styles.title}>
                  Checkout failures traced to a shrunken database pool
                </Dialog.Title>
              </header>

              <dl className={styles.fields}>
                {FIELDS.map((field) => (
                  <div key={field.label} className={styles.field}>
                    <dt className={styles.fieldLabel}>{field.label}</dt>
                    <dd className={styles.fieldValue}>{field.value}</dd>
                  </div>
                ))}
              </dl>

              <Dialog.Description className={styles.summary}>
                A config reload quietly shrank one instance’s database pool, and
                checkout started timing out. The trigger landed minutes before
                the first failure and carried no request id — so following the
                trace only ever circled the symptom.{" "}
                <em className={styles.closer}>
                  The cause was never in the trace; it was in the lines around
                  it.
                </em>
              </Dialog.Description>
            </div>
          </ScrollArea>

          <footer className={styles.actions}>
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
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
