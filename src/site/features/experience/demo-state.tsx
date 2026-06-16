"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import { type OpenContext } from "@/demo";

/** The scattered context slices of phase one: which lines are open (by
 * id) and which tab is showing (null means the live tail). */
type Tabs = {
  readonly ids: readonly string[];
  readonly active: string | null;
};

/** The steps the explorer reports from a single snapshot — transient
 * readings, not authoritative progress. The reducer folds these into the
 * sticky Progress, so a false reading here can't clear a latched step. */
type ProgressSignals = {
  readonly traced: boolean;
  readonly examined: boolean;
  readonly stacked: boolean;
  readonly surfaced: boolean;
};

/** The investigation's checklist — each step latches the first time it's
 * reported and never un-latches, so the store only ever gains steps.
 * `opened`/`piled` latch from tab opens in phase one; the rest are folded
 * in from explorer snapshots. */
type Progress = ProgressSignals & {
  readonly opened: boolean;
  readonly piled: boolean;
};

/** Which phase the investigation is in: phase one scatters context into
 * tabs; the cut advances to phase two, which expands context in place. */
export type Phase = "phase-one" | "phase-two";

/* One investigation, shared across the whole demo. `runId` bumps on reset
 * so the view remounts and the explorer's internal filter — which can't be
 * cleared any other way — starts over. The phase, filter (scenarioIds),
 * the scattered tabs of phase one, the stacked phase-two contexts, and
 * the checklist all live here, so they survive in-app navigation and reset
 * together as one investigation. */
type DemoState = {
  readonly runId: number;
  readonly phase: Phase;
  readonly scenarioIds: readonly string[];
  readonly everFiltered: boolean;
  readonly tabs: Tabs;
  readonly openContexts: readonly OpenContext[];
  readonly progress: Progress;
};

const INITIAL_STATE: DemoState = {
  runId: 0,
  phase: "phase-one",
  scenarioIds: [],
  everFiltered: false,
  tabs: { ids: [], active: null },
  openContexts: [],
  progress: {
    traced: false,
    examined: false,
    stacked: false,
    surfaced: false,
    opened: false,
    piled: false,
  },
};

type Action =
  | { type: "filter"; scenarioIds: readonly string[] }
  | { type: "openTab"; id: string }
  | { type: "closeTab"; id: string }
  | { type: "activateTab"; active: string | null }
  | { type: "markFiltered" }
  | { type: "contexts"; openContexts: readonly OpenContext[] }
  | { type: "observe"; observed: ProgressSignals }
  | { type: "cut" }
  | { type: "reset" };

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "filter":
      return { ...state, scenarioIds: action.scenarioIds };
    case "openTab": {
      const open = state.tabs.ids.includes(action.id);
      const ids = open ? state.tabs.ids : [...state.tabs.ids, action.id];
      // Latch the phase-one checklist the same way the explorer-driven steps
      // latch: the tab open is the signal, and the step never un-sets — so
      // closing a tab can't un-check "opened a slice" or "piled two up".
      return {
        ...state,
        tabs: { ids, active: action.id },
        progress: {
          ...state.progress,
          opened: state.progress.opened || ids.length >= 1,
          piled: state.progress.piled || ids.length >= 2,
        },
      };
    }
    case "closeTab": {
      const { tabs } = state;
      return {
        ...state,
        tabs: {
          ids: tabs.ids.filter((id) => id !== action.id),
          // Fall back to the live tail when the active slice closes.
          active: tabs.active === action.id ? null : tabs.active,
        },
      };
    }
    case "activateTab":
      return { ...state, tabs: { ...state.tabs, active: action.active } };
    case "markFiltered":
      return state.everFiltered ? state : { ...state, everFiltered: true };
    case "contexts":
      return { ...state, openContexts: action.openContexts };
    case "observe": {
      // The checklist is sticky: a step latches the first time it's
      // observed and never un-latches, so the store only ever gains steps.
      const p = state.progress;
      const o = action.observed;
      const next: Progress = {
        ...p,
        traced: p.traced || o.traced,
        examined: p.examined || o.examined,
        stacked: p.stacked || o.stacked,
        surfaced: p.surfaced || o.surfaced,
      };
      if (
        next.traced === p.traced &&
        next.examined === p.examined &&
        next.stacked === p.stacked &&
        next.surfaced === p.surfaced
      ) {
        return state;
      }
      return { ...state, progress: next };
    }
    case "cut": {
      // The cut ends phase one: it clears the scattered tabs and returns
      // to the filtered live tail in place, deliberately opening no context.
      // Phase two is hands-on — the visitor opens context themselves to earn
      // the payoff. Idempotent — the demo only ever moves forward to phase two.
      if (state.phase === "phase-two") return state;
      return {
        ...state,
        phase: "phase-two",
        tabs: { ids: [], active: null },
        openContexts: [],
      };
    }
    case "reset":
      return { ...INITIAL_STATE, runId: state.runId + 1 };
  }
}

type DemoStateValue = {
  readonly state: DemoState;
  readonly setScenarios: (ids: readonly string[]) => void;
  readonly openTab: (id: string) => void;
  readonly closeTab: (id: string) => void;
  readonly activateTab: (active: string | null) => void;
  readonly markFiltered: () => void;
  readonly setContexts: (openContexts: readonly OpenContext[]) => void;
  readonly observe: (observed: ProgressSignals) => void;
  /** Ends phase one: clears the scattered tabs and returns to the
   * filtered live tail to open context in place. */
  readonly cut: () => void;
  /** Clears the whole investigation and starts its run over. */
  readonly reset: () => void;
};

const DemoStateContext = createContext<DemoStateValue | null>(null);

export function useDemoState(): DemoStateValue {
  const value = useContext(DemoStateContext);
  if (!value) {
    throw new Error("useDemoState must be used within DemoStateProvider");
  }
  return value;
}

/**
 * The demo's single investigation, held above every route so it survives
 * in-app navigation — a visitor can break off to read the story and return
 * to the demo exactly where they left it. Plain React state, so a full
 * page reload (leaving the app) starts fresh; the reset control clears it
 * deliberately within a session.
 */
export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // dispatch is stable, so these wrappers stay stable too — the views wire
  // them into report effects whose deps must not churn on every change.
  const setScenarios = useCallback(
    (scenarioIds: readonly string[]) =>
      dispatch({ type: "filter", scenarioIds }),
    [],
  );
  const openTab = useCallback(
    (id: string) => dispatch({ type: "openTab", id }),
    [],
  );
  const closeTab = useCallback(
    (id: string) => dispatch({ type: "closeTab", id }),
    [],
  );
  const activateTab = useCallback(
    (active: string | null) => dispatch({ type: "activateTab", active }),
    [],
  );
  const markFiltered = useCallback(
    () => dispatch({ type: "markFiltered" }),
    [],
  );
  const setContexts = useCallback(
    (openContexts: readonly OpenContext[]) =>
      dispatch({ type: "contexts", openContexts }),
    [],
  );
  const observe = useCallback(
    (observed: ProgressSignals) => dispatch({ type: "observe", observed }),
    [],
  );
  const cut = useCallback(() => dispatch({ type: "cut" }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value = useMemo<DemoStateValue>(
    () => ({
      state,
      setScenarios,
      openTab,
      closeTab,
      activateTab,
      markFiltered,
      setContexts,
      observe,
      cut,
      reset,
    }),
    [
      state,
      setScenarios,
      openTab,
      closeTab,
      activateTab,
      markFiltered,
      setContexts,
      observe,
      cut,
      reset,
    ],
  );

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  );
}
