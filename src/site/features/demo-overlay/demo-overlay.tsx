"use client";

import * as Dialog from "@radix-ui/react-dialog";

import { LogExplorer, type FilterState, type LogLine } from "@/demo";
import { Button } from "@/site/ui/button/button";

import styles from "./demo-overlay.module.css";

/**
 * Full-screen overlay hosting the live demo. Esc-to-dismiss is left to
 * Radix's default, which only fires once the explorer's own Esc handling
 * has nothing left to do (see the capture-phase handler in LogExplorer).
 */
export function DemoOverlay({
  open,
  onOpenChange,
  lines,
  initialFilter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: readonly LogLine[];
  initialFilter?: FilterState;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <Dialog.Title className={styles.srOnly}>Live demo</Dialog.Title>
          <div className={styles.bar}>
            <div className={styles.crumb}>
              <Dialog.Close asChild>
                <Button variant="link" className={styles.crumbHome}>
                  Log Explorer
                </Button>
              </Dialog.Close>
              <span className={styles.crumbSep} aria-hidden="true">
                /
              </span>
              <span className={styles.crumbHere}>Live demo</span>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" aria-label="Exit the demo">
                Exit ✕
              </Button>
            </Dialog.Close>
          </div>
          <div className={styles.frame}>
            <LogExplorer lines={lines} initialFilter={initialFilter} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
