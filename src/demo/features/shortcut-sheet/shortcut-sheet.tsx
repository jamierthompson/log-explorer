"use client";

import * as Dialog from "@radix-ui/react-dialog";

import { KeycapSequence } from "@/demo/ui/keycap/keycap";
import {
  SHORTCUT_GROUPS,
  SHORTCUTS,
  type ShortcutDef,
} from "@/demo/lib/keyboard-shortcuts";

import styles from "./shortcut-sheet.module.css";

export function ShortcutSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} data-logx-surface>
          {/* Esc still works; this gives pointer and AT users a visible,
           * labeled way out. */}
          {/* Inline X (matching the site's close icon) so the demo's chrome
           * stays free of an icon-library dependency. */}
          <Dialog.Close className={styles.close} aria-label="Close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Dialog.Close>
          <header className={styles.head}>
            <p className={styles.eyebrow}>Reference</p>
            <Dialog.Title className={styles.title}>
              Keyboard shortcuts
            </Dialog.Title>
            <Dialog.Description className={styles.subtitle}>
              Every binding the log explorer responds to.
            </Dialog.Description>
            {/* The lone meta-binding rides in the header instead of a
             * one-row section of its own. */}
            <p className={styles.headHint}>
              <KeycapSequence keys={SHORTCUTS.openShortcuts.keys} />
              {SHORTCUTS.openShortcuts.description}
            </p>
          </header>

          <div className={styles.groups}>
            {SHORTCUT_GROUPS.filter(
              (group) =>
                !(group.ids as readonly string[]).includes("openShortcuts"),
            ).map((group) => (
              <section key={group.title} className={styles.group}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <dl className={styles.list}>
                  {group.ids.map((id) => {
                    /*
                     * Widen at the read site: `as const satisfies`
                     * makes every entry's type literal, so iterating
                     * by id would land us on a union that doesn't
                     * uniformly carry `aliases`.
                     */
                    const shortcut: ShortcutDef = SHORTCUTS[id];
                    return (
                      <div key={id} className={styles.row}>
                        <dt className={styles.keys}>
                          <KeycapSequence
                            keys={shortcut.keys}
                            aliases={shortcut.aliases}
                          />
                        </dt>
                        <dd className={styles.description}>
                          {shortcut.description}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
