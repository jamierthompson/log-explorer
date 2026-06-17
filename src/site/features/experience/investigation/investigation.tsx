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
import { ACT_CONTENT } from "./act-content";
import { InvestigationStage } from "./investigation-stage";

/**
 * The demo's single investigation, staged in two acts against one shared
 * store. Both acts render into the same browser-style tab strip: in act one
 * the explorer delegates context out, so opening a line spawns a slice tab
 * beside the live tail and the work scatters; the cut clears those slice
 * tabs — leaving the live tail standing — and switches the same explorer to
 * act two, which expands context where the line lives. The checklist and
 * filter persist across the cut and reset as one.
 */
export function Investigation({
  lines,
  onCallRootCause,
  onReset,
}: {
  lines: readonly LogLine[];
  /** Opens the root-cause call — act two's closing action. */
  onCallRootCause: () => void;
  /** Resets the whole investigation in place — the guide's control. */
  onReset: () => void;
}) {
  const { state, setScenarios, markFiltered, setContexts, observe, openTab, cut } =
    useDemoState();
  const announce = useDemoAnnounce();

  const { act, scenarioIds, everFiltered, openContexts, progress } = state;
  const isActTwo = act === "act-two";

  // Act one delegates each context look out to its own tab; ignore ids the
  // stream doesn't carry so a stale anchor can't open an empty tab.
  const openContext = useCallback(
    (id: string) => {
      if (lines.some((l) => l.id === id)) openTab(id);
    },
    [lines, openTab],
  );

  // The shared snapshot reporter for both acts: it latches the filter and
  // the explorer-driven checklist steps. Context only opens in place, so it's
  // persisted (and the steps observed) in act two alone.
  const handleState = useCallback(
    (snapshot: LogExplorerSnapshot) => {
      if (snapshot.hasFilter) markFiltered();
      setScenarios(snapshot.activeScenarioIds);
      if (isActTwo) setContexts(snapshot.openContexts);

      // Act-two checklist readings, keyed to the chips and context windows.
      // The final step earns by stacking a second context — the new way's
      // payoff: the cause and the failure held in one view.
      observe({
        triaged: isActTwo && snapshot.activeScenarioIds.includes("errors"),
        traced: isActTwo && snapshot.activeScenarioIds.includes("trace"),
        examined: isActTwo && snapshot.openContexts.length > 0,
        stacked: isActTwo && snapshot.openContexts.length >= 2,
      });
    },
    [isActTwo, markFiltered, setScenarios, setContexts, observe],
  );

  const content = ACT_CONTENT[act];

  // The steps are content; their done-ness is the live reading, keyed by id.
  // Act one's milestones latch from tab opens, act two's from explorer
  // snapshots — both sticky in the store.
  const doneById: Record<string, boolean> = isActTwo
    ? {
        triage: progress.triaged,
        trace: progress.traced,
        inplace: progress.examined,
        stack: progress.stacked,
      }
    : { filter: everFiltered, open: progress.opened, pile: progress.piled };

  const items: readonly GuideItem[] = content.steps.map((step) => ({
    ...step,
    done: doneById[step.id] ?? false,
  }));

  return (
    <ActLayout
      step={content.badge}
      kicker={content.kicker}
      title={content.title}
      lead={content.lead}
      aside={
        <GuideBox
          title={isActTwo ? "The method" : "What's happening"}
          items={items}
          onAnnounce={announce}
          onReset={onReset}
          action={
            isActTwo
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
      {/* Both acts live in the same tab strip. The explorer is keyed by act
          so the cut remounts it — the only way its internal filter clears —
          and act two opens on the clean live tail the cut intends. */}
      <InvestigationStage lines={lines}>
        {isActTwo ? (
          <LogExplorer
            key="act-two"
            lines={lines}
            service="api-gateway"
            initialFilter={filterFromScenarioIds(scenarioIds)}
            initialContexts={openContexts}
            onStateChange={handleState}
          />
        ) : (
          <LogExplorer
            key="act-one"
            lines={lines}
            service="api-gateway"
            showLegend={false}
            initialFilter={filterFromScenarioIds(scenarioIds)}
            onViewContext={openContext}
            onStateChange={handleState}
          />
        )}
      </InvestigationStage>
    </ActLayout>
  );
}
