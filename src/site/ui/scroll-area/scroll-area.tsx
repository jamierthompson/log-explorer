"use client";

import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import type { ReactNode } from "react";

import styles from "./scroll-area.module.css";

export function ScrollArea({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <RadixScrollArea.Root
      className={[styles.root, className].filter(Boolean).join(" ")}
      type="scroll"
    >
      <RadixScrollArea.Viewport
        className={styles.viewport}
        data-app-scroll-viewport=""
      >
        {children}
      </RadixScrollArea.Viewport>
      <RadixScrollArea.Scrollbar
        orientation="vertical"
        className={styles.scrollbar}
      >
        <RadixScrollArea.Thumb className={styles.thumb} />
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Corner />
    </RadixScrollArea.Root>
  );
}
