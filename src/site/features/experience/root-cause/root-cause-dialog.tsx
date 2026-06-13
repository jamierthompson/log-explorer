"use client";

import * as Dialog from "@radix-ui/react-dialog";

import { RootCausePanel } from "./root-cause-panel";
import styles from "./root-cause-dialog.module.css";

/**
 * The root-cause call as a modal over the Act 2 evidence. Always open — the
 * route is its open state — so dismissing (Esc, the scrim, the close
 * control) hands back to the caller, which navigates away.
 */
export function RootCauseDialog({
  onClose,
  onReplay,
  onReadStory,
}: {
  onClose: () => void;
  onReplay?: () => void;
  onReadStory?: () => void;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          {/* The panel's live heading and prose name and describe the
              dialog, so the accessible label tracks question vs. verdict. */}
          <RootCausePanel
            Title={Dialog.Title}
            Description={Dialog.Description}
            onReplay={onReplay}
            onReadStory={onReadStory}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
