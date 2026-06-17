"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/site/ui/button/button";
import { Kicker } from "@/site/ui/kicker/kicker";

import styles from "./incident-debrief.module.css";

type Field = { readonly label: string; readonly value: string };

const FIELDS: readonly Field[] = [
  { label: "Severity", value: "SEV-2" },
  { label: "Duration", value: "23 min" },
  { label: "Surface", value: "api-gateway · checkout" },
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
              A slice of checkout traffic failed for twenty-three minutes. Every
              trace dead-ended at the database — but the cause sat minutes
              upstream, outside the trace.
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
                Checkout requests on api-gateway began timing out for one slice
                of traffic, waiting on a database connection that never came.
                Two instances kept serving 200s throughout, so the fleet looked
                healthy at a glance.
              </p>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Root cause</h3>
              <p className={styles.text}>
                A config reload cut{" "}
                <code className={styles.code}>db.pool.max</code> from 20 to 5 on
                a single instance. Starved of connections, its checkouts queued
                past the timeout and failed — while its neighbors, untouched by
                the reload, stayed green.
              </p>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Why it was hard to see</h3>
              <p className={styles.text}>
                The failing trace had no thread back to the reload: it landed
                minutes earlier, with no request id to tie them together.
                Following the trace alone, you circle the database forever.
                Opening a second context around the instance — not the request —
                is what surfaced the reload sitting upstream.
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
