"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode } from "react";

import { Button } from "@/site/ui/button/button";

import styles from "./demo-stage.module.css";

/**
 * Full-screen overlay that hosts the demo experience as its children.
 * Esc-to-dismiss is left to the dialog's default, which only fires once
 * the hosted content's own Esc handling has nothing left to do.
 */
export function DemoStage({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <Dialog.Title className={styles.srOnly}>Live demo</Dialog.Title>
          <div className={styles.inner}>
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
            <div className={styles.frame}>{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
