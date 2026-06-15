import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DemoStateProvider,
  useDemoState,
} from "@/site/features/experience/demo-state";

function setup() {
  return renderHook(() => useDemoState(), { wrapper: DemoStateProvider });
}

describe("demo state", () => {
  it("opens a tab and activates it, without duplicating an open id", () => {
    const { result } = setup();

    act(() => result.current.openTab("a"));
    expect(result.current.state.tabs).toEqual({ ids: ["a"], active: "a" });

    act(() => result.current.openTab("b"));
    expect(result.current.state.tabs).toEqual({ ids: ["a", "b"], active: "b" });

    // Reopening an open id re-activates it rather than adding a second tab.
    act(() => result.current.activateTab(null));
    act(() => result.current.openTab("a"));
    expect(result.current.state.tabs).toEqual({ ids: ["a", "b"], active: "a" });
  });

  it("falls back to the live tail only when the active tab closes", () => {
    const { result } = setup();
    act(() => result.current.openTab("a"));
    act(() => result.current.openTab("b"));

    // Closing a non-active tab leaves the active one in place.
    act(() => result.current.closeTab("a"));
    expect(result.current.state.tabs).toEqual({ ids: ["b"], active: "b" });

    // Closing the active tab returns to the live tail.
    act(() => result.current.closeTab("b"));
    expect(result.current.state.tabs).toEqual({ ids: [], active: null });
  });

  it("latches everFiltered idempotently", () => {
    const { result } = setup();
    expect(result.current.state.everFiltered).toBe(false);

    act(() => result.current.markFiltered());
    const latched = result.current.state;
    expect(latched.everFiltered).toBe(true);

    // A second mark is a no-op, so no new state object is produced.
    act(() => result.current.markFiltered());
    expect(result.current.state).toBe(latched);
  });

  it("latches checklist steps stickily and ignores redundant observations", () => {
    const { result } = setup();

    act(() =>
      result.current.observe({
        triaged: true,
        traced: false,
        context: false,
        radius: false,
      }),
    );
    expect(result.current.state.progress.triaged).toBe(true);
    const latched = result.current.state;

    // Observing the step as false again doesn't un-latch it, and a round
    // that adds nothing new produces no new state object.
    act(() =>
      result.current.observe({
        triaged: false,
        traced: false,
        context: false,
        radius: false,
      }),
    );
    expect(result.current.state.progress.triaged).toBe(true);
    expect(result.current.state).toBe(latched);
  });

  it("cuts to in place, folding open tabs into stacked contexts", () => {
    const { result } = setup();
    act(() => {
      result.current.openTab("a");
      result.current.openTab("b");
    });

    act(() => result.current.cut());
    expect(result.current.state.phase).toBe("in-place");
    expect(result.current.state.openContexts).toEqual([
      { selectedLineId: "a", range: 20 },
      { selectedLineId: "b", range: 20 },
    ]);

    // The cut only ever moves toward in place — a second one is a no-op, so
    // no new state object is produced and the contexts don't duplicate.
    const after = result.current.state;
    act(() => result.current.cut());
    expect(result.current.state).toBe(after);
  });

  it("resets the whole investigation as one, bumping the run id", () => {
    const { result } = setup();
    act(() => {
      result.current.setScenarios(["errors"]);
      result.current.openTab("a");
      result.current.markFiltered();
      result.current.setContexts([{ selectedLineId: "x", range: 20 }]);
      result.current.observe({
        triaged: true,
        traced: true,
        context: true,
        radius: true,
      });
      result.current.cut();
    });

    const runBefore = result.current.state.runId;
    act(() => result.current.reset());

    // Phase, filter, tabs, contexts, and checklist all clear at once, and
    // the run id advances so the view remounts with a cleared explorer.
    expect(result.current.state).toEqual({
      runId: runBefore + 1,
      phase: "old-way",
      scenarioIds: [],
      everFiltered: false,
      tabs: { ids: [], active: null },
      openContexts: [],
      progress: {
        triaged: false,
        traced: false,
        context: false,
        radius: false,
      },
    });
  });
});
