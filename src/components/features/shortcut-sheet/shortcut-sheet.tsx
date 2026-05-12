"use client";

import * as Dialog from "@radix-ui/react-dialog";

import { KeycapSequence } from "@/components/ui/keycap/keycap";
import {
  SHORTCUT_GROUPS,
  SHORTCUTS,
  type ShortcutDef,
} from "@/lib/keyboard-shortcuts";

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
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>
            Keyboard shortcuts
          </Dialog.Title>
          <Dialog.Description className={styles.subtitle}>
            Every binding the log explorer responds to.
          </Dialog.Description>

          <div className={styles.groups}>
            {SHORTCUT_GROUPS.map((group) => (
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
