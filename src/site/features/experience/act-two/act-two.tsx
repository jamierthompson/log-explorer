"use client";

import { useCallback, useRef, useState } from "react";

import { LogExplorer, type LogExplorerSnapshot, type LogLine } from "@/demo";

import { ActLayout } from "../act-layout/act-layout";
import { GuideBox, type GuideItem } from "../guide-box/guide-box";
import { RootCauseDialog } from "../root-cause-dialog/root-cause-dialog";

/* Progress is sticky: each step latches the first time the explorer
 * reports it, so the checklist tracks how far the investigation got rather
 * than the explorer's current state — closing a context can't un-check a
 * step the visitor already reached. */
type Progress = {
  readonly triaged: boolean;
  readonly traced: boolean;
  readonly context: boolean;
  readonly radius: boolean;
};

const INITIAL_PROGRESS: Progress = {
  triaged: false,
  traced: false,
  context: false,
  radius: false,
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
  onReadStory,
  onAnnounce,
}: {
  lines: readonly LogLine[];
  onReplay?: () => void;
  onReadStory?: () => void;
  onAnnounce?: (message: string) => void;
}) {
  const [rootCauseOpen, setRootCauseOpen] = useState(false);
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);

  /* The blast-radius step counts every context opened this run, not how
   * many are open at once — the explorer teaches closing a context when
   * done with it, so a visitor who opens one, closes it, then opens
   * another has compared two places and earned the step. */
  const contextsOpened = useRef(0);
  const prevOpenCount = useRef(0);

  const handleState = useCallback((snapshot: LogExplorerSnapshot) => {
    if (snapshot.openContextCount > prevOpenCount.current) {
      contextsOpened.current +=
        snapshot.openContextCount - prevOpenCount.current;
    }
    prevOpenCount.current = snapshot.openContextCount;

    const active = snapshot.activeScenarioIds;
    setProgress((prev) => ({
      triaged: prev.triaged || active.includes("errors"),
      traced: prev.traced || active.includes("trace"),
      context: prev.context || snapshot.openContextCount >= 1,
      radius:
        prev.radius ||
        contextsOpened.current >= 2 ||
        active.includes("instance"),
    }));
  }, []);

  const callRootCause = useCallback(() => {
    setRootCauseOpen(true);
  }, []);

  const items: readonly GuideItem[] = [
    {
      id: "triage",
      title: "Triage the symptom",
      description: "Filter to errors to see what’s actually failing.",
      done: progress.triaged,
    },
    {
      id: "trace",
      title: "Trace the failing request",
      description:
        "Follow req=r4d8a2 span by span. It dies waiting on the db pool.",
      done: progress.traced,
    },
    {
      id: "context",
      title: "Open context in place",
      description:
        "The cause carries no request id — only the lines around the failure can show it. Not there yet? Shift+E widens the window.",
      done: progress.context,
    },
    {
      id: "radius",
      title: "Check the blast radius",
      description:
        "One instance, or all three? Open another context — or narrow to @kc4qn — and see.",
      done: progress.radius,
    },
  ];

  return (
    <>
      <ActLayout
        step="Act 2"
        kicker="In place"
        title="Open context where the line lives"
        lead="The same investigation, kept in one view. The trace can show you where checkout broke — opening context in place shows you why."
        aside={
          <GuideBox
            title="The Method"
            items={items}
            onAnnounce={onAnnounce}
            action={{
              label: "Call the root cause",
              onClick: callRootCause,
            }}
            foot={
              <>
                Checkout times out at <strong>13:31:58</strong>. What put it
                there?
              </>
            }
          />
        }
      >
        <LogExplorer
          lines={lines}
          service="api-gateway"
          onStateChange={handleState}
        />
      </ActLayout>
      <RootCauseDialog
        open={rootCauseOpen}
        onOpenChange={setRootCauseOpen}
        onReplay={onReplay}
        onReadStory={onReadStory}
      />
    </>
  );
}
