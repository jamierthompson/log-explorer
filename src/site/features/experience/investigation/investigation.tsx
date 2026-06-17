"use client";

import { ArrowRight } from "lucide-react";
import { useCallback } from "react";

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
import { PHASE_CONTENT } from "./phase-content";
import { ScatterView } from "./scatter-view";

/**
 * The demo's single investigation, staged in two phases against one shared
 * store. In phase one the explorer delegates context out, so opening a line
 * spawns a browser-style tab and the work scatters; the cut clears those
 * tabs and switches the same explorer to phase two — expanding context where
 * the line lives. The checklist and filter persist across the cut and reset
 * as one.
 */
export function Investigation({
  lines,
  onCallRootCause,
  onReset,
}: {
  lines: readonly LogLine[];
  /** Opens the root-cause call — phase two's closing action. */
  onCallRootCause: () => void;
  /** Resets the whole investigation in place — the guide's control. */
  onReset: () => void;
}) {
  const { state, setScenarios, markFiltered, setContexts, observe, cut } =
    useDemoState();
  const announce = useDemoAnnounce();

  const { phase, scenarioIds, everFiltered, openContexts, progress } = state;
  const isPhaseTwo = phase === "phase-two";

  // The shared snapshot reporter for both phases: it latches the filter and
  // the explorer-driven checklist steps. Context only opens in place, so it's
  // persisted (and the steps observed) in phase two alone.
  const handleState = useCallback(
    (snapshot: LogExplorerSnapshot) => {
      if (snapshot.hasFilter) markFiltered();
      setScenarios(snapshot.activeScenarioIds);
      if (isPhaseTwo) setContexts(snapshot.openContexts);

      observe({
        traced: snapshot.activeScenarioIds.includes("trace"),
        examined: isPhaseTwo && snapshot.openContexts.length > 0,
        stacked: isPhaseTwo && snapshot.openContexts.length >= 2,
        surfaced: isPhaseTwo && snapshot.hasExpandedContext,
      });
    },
    [isPhaseTwo, markFiltered, setScenarios, setContexts, observe],
  );

  const content = PHASE_CONTENT[phase];

  // The steps are content; their done-ness is the live reading, keyed by id.
  // Phase one's milestones latch from tab opens, phase two's from explorer
  // snapshots — both sticky in the store.
  const doneById: Record<string, boolean> = isPhaseTwo
    ? {
        inplace: progress.examined,
        stack: progress.stacked,
        upstream: progress.surfaced,
      }
    : { filter: everFiltered, open: progress.opened, pile: progress.piled };

  const items: readonly GuideItem[] = content.steps.map((step) => ({
    ...step,
    done: doneById[step.id] ?? false,
  }));

  return (
    <ActLayout
      step="Investigation"
      title={content.title}
      lead={content.lead}
      aside={
        <GuideBox
          title="Your investigation"
          items={items}
          onAnnounce={announce}
          onReset={onReset}
          action={
            isPhaseTwo
              ? { label: content.actionLabel, onClick: onCallRootCause }
              : {
                  label: (
                    <>
                      {content.actionLabel}
                      <ArrowRight size={16} aria-hidden="true" />
                    </>
                  ),
                  onClick: cut,
                }
          }
        />
      }
    >
      {isPhaseTwo ? (
        <LogExplorer
          lines={lines}
          service="api-gateway"
          initialFilter={filterFromScenarioIds(scenarioIds)}
          initialContexts={openContexts}
          onStateChange={handleState}
        />
      ) : (
        <ScatterView lines={lines} onState={handleState} />
      )}
    </ActLayout>
  );
}
