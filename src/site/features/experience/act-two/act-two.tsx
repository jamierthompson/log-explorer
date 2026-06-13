"use client";

import { useCallback, useRef, useState } from "react";

import {
  filterFromScenarioIds,
  LogExplorer,
  type LogExplorerSnapshot,
  type LogLine,
} from "@/demo";

import { ActLayout } from "../act-layout/act-layout";
import { useDemoAnnounce } from "../demo-shell";
import { useDemoState } from "../demo-state";
import { GuideBox, type GuideItem } from "../guide-box/guide-box";
import { RootCauseDialog } from "../root-cause-dialog/root-cause-dialog";

/**
 * Act 2 — the method. The real explorer with context-in-place, paired
 * with a guide whose closing action opens the root-cause call. The dialog
 * lives here, with the explorer it concludes.
 *
 * Its checklist is held in the demo store above the route, so leaving for
 * Act 1 (or the story) and returning restores it. A reset clears that
 * state and remounts the act, so the checklist and explorer come back
 * fresh.
 */
export function ActTwo({
  lines,
  onReadStory,
  onReset,
  onReplay,
}: {
  lines: readonly LogLine[];
  onReadStory?: () => void;
  /** Resets this act in place — the guide's per-act control. */
  onReset: () => void;
  /** Restarts the whole incident from Act 1 — the dialog's closing choice. */
  onReplay?: () => void;
}) {
  const { state, setAct2Scenarios, setAct2Contexts, observeAct2 } =
    useDemoState();
  const announce = useDemoAnnounce();

  const [rootCauseOpen, setRootCauseOpen] = useState(false);
  // Read straight from the store — the single source of truth — so the
  // checklist always reflects persisted progress with no local copy to
  // drift out of sync across navigation.
  const { scenarioIds, openContexts, progress } = state.act2;

  /* The blast-radius step counts every context opened this run, not how
   * many are open at once — the explorer teaches closing a context when
   * done with it, so a visitor who opens one, closes it, then opens
   * another has compared two places and earned the step.
   *
   * These counters are local and restart at zero on every remount (a
   * reset or a return visit). That's safe only because the step is sticky
   * in the store: a fresh counter can re-observe the step but never
   * un-observe it. A non-sticky checklist would need this count persisted. */
  const contextsOpened = useRef(0);
  const prevOpenCount = useRef(0);

  const handleState = useCallback(
    (snapshot: LogExplorerSnapshot) => {
      if (snapshot.openContextCount > prevOpenCount.current) {
        contextsOpened.current +=
          snapshot.openContextCount - prevOpenCount.current;
      }
      prevOpenCount.current = snapshot.openContextCount;

      const active = snapshot.activeScenarioIds;
      setAct2Scenarios(active);
      setAct2Contexts(snapshot.openContexts);
      observeAct2({
        triaged: active.includes("errors"),
        traced: active.includes("trace"),
        context: snapshot.openContextCount >= 1,
        radius: contextsOpened.current >= 2 || active.includes("instance"),
      });
    },
    [setAct2Scenarios, setAct2Contexts, observeAct2],
  );

  const callRootCause = useCallback(() => {
    setRootCauseOpen(true);
  }, []);

  /*
   * The dialog portals to the document body; close it as part of the
   * handoff to the story so it doesn't outlive the act.
   */
  const readStoryAndClose = useCallback(() => {
    setRootCauseOpen(false);
    onReadStory?.();
  }, [onReadStory]);

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
            onAnnounce={announce}
            onReset={onReset}
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
          initialFilter={filterFromScenarioIds(scenarioIds)}
          initialContexts={openContexts}
          onStateChange={handleState}
        />
      </ActLayout>
      <RootCauseDialog
        open={rootCauseOpen}
        onOpenChange={setRootCauseOpen}
        onReplay={onReplay}
        onReadStory={onReadStory && readStoryAndClose}
      />
    </>
  );
}
