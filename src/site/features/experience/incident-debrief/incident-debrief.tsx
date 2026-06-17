"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/site/ui/button/button";
import { Kicker } from "@/site/ui/kicker/kicker";

import styles from "./incident-debrief.module.css";

type Field = { readonly label: string; readonly value: string };

const FIELDS: readonly Field[] = [
  { label: "Surface", value: "api-gateway · checkout" },
  { label: "Instance", value: "kc4qn" },
  { label: "Duration", value: "~9 min" },
  { label: "Status", value: "Resolved" },
];

/**
 * The incident debrief — the close of the two acts, surfaced in place over
 * the investigation rather than on a route of its own. A narrated report
 * that names the root cause and, more to the point, shows how the
 * investigation reached it: the trace dead-ended at the database, and a
 * second context around the instance surfaced the config reload sitting
 * minutes upstream. That cross-context jump is the handoff into the build
 * story. Copy here is a first pass.
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

          <header className={styles.head}>
            <Kicker tone="accent">Incident debrief</Kicker>
            <Dialog.Title className={styles.title}>
              Checkout failures traced to a shrunken database pool
            </Dialog.Title>
            <Dialog.Description className={styles.summary}>
              Checkout and cart requests on one instance failed for about nine
              minutes, each dead-ending at a database-pool timeout. The cause
              sat minutes upstream of the first failure — outside the trace.
            </Dialog.Description>
          </header>

          <dl className={styles.fields}>
            {FIELDS.map((field) => (
              <div key={field.label} className={styles.field}>
                <dt className={styles.fieldLabel}>{field.label}</dt>
                <dd className={styles.fieldValue}>{field.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.body}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>What happened</h3>
              <p className={styles.text}>
                On one instance, checkout and cart requests began returning 503s
                after waiting the full five-second pool timeout for a database
                connection. The other two instances served 200s throughout, so
                the fleet looked healthy at a glance.
              </p>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Root cause</h3>
              <p className={styles.text}>
                A config hot-reload had cut{" "}
                <code className={styles.code}>db.pool.max</code> from 20 to 5 on
                that instance. The shrunken pool saturated over the next few
                minutes — connections queued, waits climbed past the timeout —
                until requests failed outright. A reverse reload back to 20
                cleared it.
              </p>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Why it was hard to see</h3>
              <p className={styles.text}>
                The reload carried no request id and landed minutes before the
                first failure, so the trace filter could never reach it — follow
                the failing request and you circle the database forever. Opening
                context around the instance, not the request, is what surfaced
                the reload sitting upstream.
              </p>
            </section>
          </div>

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
