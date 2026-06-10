"use client";

import { useState } from "react";

import { Legend, type LegendItem } from "@/demo";
import { FigureCaption } from "@/site/ui/figure/figure";

import styles from "./legend-demo.module.css";

/**
 * The Legend embedded live in the prose that describes it — the real
 * component, not a picture of it. A tiny simulation stands in for the
 * explorer: one context is notionally open, so Expand and Close apply.
 * Expand re-fires its pulse on each press; Close retires both entries
 * (nothing left to expand or close), leaving the fallback hint — which
 * here restores the pair instead of opening the shortcut sheet.
 */
export function LegendDemo() {
  const [contextOpen, setContextOpen] = useState(true);
  const [expandPulse, setExpandPulse] = useState(0);

  const items: readonly LegendItem[] = contextOpen
    ? [
        {
          keys: ["Shift", "E"],
          label: "Expand",
          ariaLabel: "Expand the most recent context",
          onClick: () => setExpandPulse((k) => k + 1),
          pulseKey: expandPulse,
        },
        {
          keys: ["Esc"],
          label: "Close",
          ariaLabel: "Close the most recent context",
          onClick: () => setContextOpen(false),
        },
      ]
    : [
        {
          keys: ["?"],
          label: "shortcuts",
          ariaLabel: "Restore the expand and close entries",
          onClick: () => setContextOpen(true),
        },
      ];

  return (
    <figure className={styles.figure}>
      <div className={styles.stage}>
        <Legend items={items} />
      </div>
      <FigureCaption>
        The real component, live — try it. The pulse on Expand is the
        acknowledgement that a keypress landed while its effect was off-screen.
      </FigureCaption>
    </figure>
  );
}
