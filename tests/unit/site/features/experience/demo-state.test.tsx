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

    act(() => result.current.openAct1Tab("a"));
    expect(result.current.state.act1.tabs).toEqual({ ids: ["a"], active: "a" });

    act(() => result.current.openAct1Tab("b"));
    expect(result.current.state.act1.tabs).toEqual({
      ids: ["a", "b"],
      active: "b",
    });

    // Reopening an open id re-activates it rather than adding a second tab.
    act(() => result.current.activateAct1Tab(null));
    act(() => result.current.openAct1Tab("a"));
    expect(result.current.state.act1.tabs).toEqual({
      ids: ["a", "b"],
      active: "a",
    });
  });

  it("falls back to the live tail only when the active tab closes", () => {
    const { result } = setup();
    act(() => result.current.openAct1Tab("a"));
    act(() => result.current.openAct1Tab("b"));

    // Closing a non-active tab leaves the active one in place.
    act(() => result.current.closeAct1Tab("a"));
    expect(result.current.state.act1.tabs).toEqual({ ids: ["b"], active: "b" });

    // Closing the active tab returns to the live tail.
    act(() => result.current.closeAct1Tab("b"));
    expect(result.current.state.act1.tabs).toEqual({ ids: [], active: null });
  });

  it("latches everFiltered idempotently", () => {
    const { result } = setup();
    expect(result.current.state.act1.everFiltered).toBe(false);

    act(() => result.current.markAct1Filtered());
    const latched = result.current.state;
    expect(latched.act1.everFiltered).toBe(true);

    // A second mark is a no-op, so no new state object is produced.
    act(() => result.current.markAct1Filtered());
    expect(result.current.state).toBe(latched);
  });

  it("latches Act 2 steps stickily and ignores redundant observations", () => {
    const { result } = setup();

    act(() =>
      result.current.observeAct2({
        triaged: true,
        traced: false,
        context: false,
        radius: false,
      }),
    );
    expect(result.current.state.act2.progress.triaged).toBe(true);
    const latched = result.current.state;

    // Observing the step as false again doesn't un-latch it, and a round
    // that adds nothing new produces no new state object.
    act(() =>
      result.current.observeAct2({
        triaged: false,
        traced: false,
        context: false,
        radius: false,
      }),
    );
    expect(result.current.state.act2.progress.triaged).toBe(true);
    expect(result.current.state).toBe(latched);
  });

  it("resets one act without touching the other, bumping only its run id", () => {
    const { result } = setup();
    act(() => {
      result.current.setAct1Scenarios(["errors"]);
      result.current.openAct1Tab("a");
      result.current.markAct1Filtered();
      result.current.setAct2Scenarios(["errors"]);
      result.current.observeAct2({
        triaged: true,
        traced: true,
        context: true,
        radius: true,
      });
    });

    const act2Before = result.current.state.act2;
    const act1RunBefore = result.current.state.act1.runId;

    act(() => result.current.resetAct1());

    // Act 1 is cleared and its run id advances...
    expect(result.current.state.act1).toEqual({
      runId: act1RunBefore + 1,
      scenarioIds: [],
      tabs: { ids: [], active: null },
      everFiltered: false,
    });
    // ...while Act 2 is left exactly as it was.
    expect(result.current.state.act2).toBe(act2Before);

    const act2RunBefore = result.current.state.act2.runId;
    act(() => result.current.resetAct2());
    expect(result.current.state.act2.runId).toBe(act2RunBefore + 1);
    expect(result.current.state.act2.progress.triaged).toBe(false);
    expect(result.current.state.act2.scenarioIds).toEqual([]);
  });
});
