"use client";

import { useCallback, useState } from "react";

import { LogExplorer, type LogExplorerSnapshot, type LogLine } from "@/demo";

import { ActLayout } from "../act-layout/act-layout";
import { GuideBox, type GuideItem } from "../guide-box/guide-box";
import { RootCauseDialog } from "../root-cause-dialog/root-cause-dialog";

/* Progress is sticky: each step latches the first time the explorer
 * reports it, so the checklist tracks how far the investigation got rather
 * than the explorer's current state — closing a context can't un-check a
 * step the visitor already reached. */
type Progress = {
  readonly filtered: boolean;
  readonly context: boolean;
  readonly stack: boolean;
};

const INITIAL_PROGRESS: Progress = {
  filtered: false,
  context: false,
  stack: false,
};

/**
 * Act 2 — the method. The real explorer with context-in-place, paired
 * with a guide whose closing action opens the root-cause call. The dialog
 * lives here, with the explorer it concludes, rather than up in the
 * sequencer.
 */
export function ActTwo({
  lines,
  onReplay,
}: {
  lines: readonly LogLine[];
  onReplay?: () => void;
}) {
  const [rootCauseOpen, setRootCauseOpen] = useState(false);
  const [called, setCalled] = useState(false);
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);

  const handleState = useCallback((snapshot: LogExplorerSnapshot) => {
    setProgress((prev) => ({
      filtered: prev.filtered || snapshot.hasFilter,
      context: prev.context || snapshot.openContextCount >= 1,
      stack: prev.stack || snapshot.openContextCount >= 2,
    }));
  }, []);

  const callRootCause = useCallback(() => {
    setCalled(true);
    setRootCauseOpen(true);
  }, []);

  const items: readonly GuideItem[] = [
    {
      id: "narrow",
      title: "Narrow to the failure",
      description: "Filter the live tail to the one request that failed.",
      done: progress.filtered,
    },
    {
      id: "context",
      title: "Open context in place",
      description: "Click a line to expand the rows around it — filter intact.",
      done: progress.context,
    },
    {
      id: "stack",
      title: "Stack a second context",
      description: "Open another without losing the first or your position.",
      done: progress.stack,
    },
    {
      id: "cause",
      title: "Call the root cause",
      description: "Name what broke, once the picture is clear.",
      done: called,
    },
  ];

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
            items={items}
            action={{
              label: "Call the root cause",
              onClick: callRootCause,
            }}
          />
        }
      >
        <LogExplorer lines={lines} onStateChange={handleState} />
      </ActLayout>
      <RootCauseDialog
        open={rootCauseOpen}
        onOpenChange={setRootCauseOpen}
        onReplay={onReplay}
      />
    </>
  );
}
