"use client";

import { useState } from "react";

import { LogExplorer, type LogLine } from "@/demo";

import { ActLayout } from "../act-layout/act-layout";
import { GuideBox, type GuideItem } from "../guide-box/guide-box";
import { RootCauseDialog } from "../root-cause-dialog/root-cause-dialog";

const GUIDE_ITEMS: readonly GuideItem[] = [
  {
    id: "narrow",
    title: "Narrow to the failure",
    description: "Filter the live tail to the one request that failed.",
  },
  {
    id: "context",
    title: "Open context in place",
    description: "Click a line to expand the rows around it — filter intact.",
  },
  {
    id: "stack",
    title: "Stack a second context",
    description: "Open another without losing the first or your position.",
  },
  {
    id: "cause",
    title: "Call the root cause",
    description: "Name what broke, once the picture is clear.",
  },
];

/**
 * Act 2 — the method. The real explorer with context-in-place, paired
 * with a guide whose closing action opens the root-cause call. The dialog
 * lives here, with the explorer it concludes, rather than up in the
 * sequencer.
 */
export function ActTwo({ lines }: { lines: readonly LogLine[] }) {
  const [rootCauseOpen, setRootCauseOpen] = useState(false);

  return (
    <>
      <ActLayout
        step="Act 2"
        kicker="In place"
        title="The same investigation, kept in one view"
        lead="Open context where the line lives. The filter holds, your position holds, and every view stacks in the same window."
        aside={
          <GuideBox
            title="The Method"
            items={GUIDE_ITEMS}
            action={{
              label: "Call the root cause",
              onClick: () => setRootCauseOpen(true),
            }}
            note="The filter holds and your place holds — make the call when the picture is clear."
          />
        }
      >
        <LogExplorer lines={lines} />
      </ActLayout>
      <RootCauseDialog open={rootCauseOpen} onOpenChange={setRootCauseOpen} />
    </>
  );
}
