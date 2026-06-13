"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

/** The open context slices in Act 1: which lines are open (by id) and
 * which tab is showing (null means the live tail). */
type Act1Tabs = {
  readonly ids: readonly string[];
  readonly active: string | null;
};

/** Act 2's sticky checklist — each step latches the first time the
 * explorer reports it and never un-latches. */
type Act2Progress = {
  readonly triaged: boolean;
  readonly traced: boolean;
  readonly context: boolean;
  readonly radius: boolean;
};

/** The steps seen true in a single snapshot — transient readings, not
 * authoritative progress. The reducer folds these into the sticky
 * Act2Progress, so a false reading here can't clear a latched step. */
type Act2Signals = Act2Progress;

/* Each act carries a run id, bumped when that act resets, so the view
 * remounts it — clearing the explorer's internal filter, which can't be
 * cleared any other way. The ids are per-act, so resetting one act leaves
 * the other intact. */
type DemoState = {
  readonly act1: {
    readonly runId: number;
    readonly scenarioIds: readonly string[];
    readonly tabs: Act1Tabs;
    readonly everFiltered: boolean;
  };
  readonly act2: {
    readonly runId: number;
    readonly scenarioIds: readonly string[];
    readonly progress: Act2Progress;
  };
};

const INITIAL_ACT1: DemoState["act1"] = {
  runId: 0,
  scenarioIds: [],
  tabs: { ids: [], active: null },
  everFiltered: false,
};

const INITIAL_ACT2: DemoState["act2"] = {
  runId: 0,
  scenarioIds: [],
  progress: { triaged: false, traced: false, context: false, radius: false },
};

const INITIAL_STATE: DemoState = { act1: INITIAL_ACT1, act2: INITIAL_ACT2 };

type Action =
  | { type: "act1/filter"; scenarioIds: readonly string[] }
  | { type: "act1/openTab"; id: string }
  | { type: "act1/closeTab"; id: string }
  | { type: "act1/activateTab"; active: string | null }
  | { type: "act1/markFiltered" }
  | { type: "act2/filter"; scenarioIds: readonly string[] }
  | { type: "act2/observe"; observed: Act2Signals }
  | { type: "act1/reset" }
  | { type: "act2/reset" };

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "act1/filter":
      return {
        ...state,
        act1: { ...state.act1, scenarioIds: action.scenarioIds },
      };
    case "act1/openTab": {
      const open = state.act1.tabs.ids.includes(action.id);
      const ids = open
        ? state.act1.tabs.ids
        : [...state.act1.tabs.ids, action.id];
      return {
        ...state,
        act1: { ...state.act1, tabs: { ids, active: action.id } },
      };
    }
    case "act1/closeTab": {
      const tabs = state.act1.tabs;
      return {
        ...state,
        act1: {
          ...state.act1,
          tabs: {
            ids: tabs.ids.filter((id) => id !== action.id),
            // Fall back to the live tail when the active slice closes.
            active: tabs.active === action.id ? null : tabs.active,
          },
        },
      };
    }
    case "act1/activateTab":
      return {
        ...state,
        act1: {
          ...state.act1,
          tabs: { ...state.act1.tabs, active: action.active },
        },
      };
    case "act1/markFiltered":
      return state.act1.everFiltered
        ? state
        : { ...state, act1: { ...state.act1, everFiltered: true } };
    case "act2/filter":
      return {
        ...state,
        act2: { ...state.act2, scenarioIds: action.scenarioIds },
      };
    case "act2/observe": {
      // The checklist is sticky: a step latches the first time it's
      // observed and never un-latches, so the store only ever gains steps.
      const p = state.act2.progress;
      const o = action.observed;
      const next: Act2Progress = {
        triaged: p.triaged || o.triaged,
        traced: p.traced || o.traced,
        context: p.context || o.context,
        radius: p.radius || o.radius,
      };
      if (
        next.triaged === p.triaged &&
        next.traced === p.traced &&
        next.context === p.context &&
        next.radius === p.radius
      ) {
        return state;
      }
      return { ...state, act2: { ...state.act2, progress: next } };
    }
    case "act1/reset":
      return {
        ...state,
        act1: { ...INITIAL_ACT1, runId: state.act1.runId + 1 },
      };
    case "act2/reset":
      return {
        ...state,
        act2: { ...INITIAL_ACT2, runId: state.act2.runId + 1 },
      };
  }
}

type DemoStateValue = {
  readonly state: DemoState;
  readonly setAct1Scenarios: (ids: readonly string[]) => void;
  readonly openAct1Tab: (id: string) => void;
  readonly closeAct1Tab: (id: string) => void;
  readonly activateAct1Tab: (active: string | null) => void;
  readonly markAct1Filtered: () => void;
  readonly setAct2Scenarios: (ids: readonly string[]) => void;
  readonly observeAct2: (observed: Act2Signals) => void;
  readonly resetAct1: () => void;
  readonly resetAct2: () => void;
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
 * The demo's progress, held above every route so it survives in-app
 * navigation — a visitor can break off to read the story and return to
 * the demo exactly where they left it. Plain React state, so a full page
 * reload (leaving the app) starts fresh; the reset control clears it
 * deliberately within a session.
 */
export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // dispatch is stable, so these wrappers stay stable too — the acts wire
  // them into report effects whose deps must not churn on every change.
  const setAct1Scenarios = useCallback(
    (scenarioIds: readonly string[]) =>
      dispatch({ type: "act1/filter", scenarioIds }),
    [],
  );
  const openAct1Tab = useCallback(
    (id: string) => dispatch({ type: "act1/openTab", id }),
    [],
  );
  const closeAct1Tab = useCallback(
    (id: string) => dispatch({ type: "act1/closeTab", id }),
    [],
  );
  const activateAct1Tab = useCallback(
    (active: string | null) => dispatch({ type: "act1/activateTab", active }),
    [],
  );
  const markAct1Filtered = useCallback(
    () => dispatch({ type: "act1/markFiltered" }),
    [],
  );
  const setAct2Scenarios = useCallback(
    (scenarioIds: readonly string[]) =>
      dispatch({ type: "act2/filter", scenarioIds }),
    [],
  );
  const observeAct2 = useCallback(
    (observed: Act2Signals) => dispatch({ type: "act2/observe", observed }),
    [],
  );
  const resetAct1 = useCallback(() => dispatch({ type: "act1/reset" }), []);
  const resetAct2 = useCallback(() => dispatch({ type: "act2/reset" }), []);

  const value = useMemo<DemoStateValue>(
    () => ({
      state,
      setAct1Scenarios,
      openAct1Tab,
      closeAct1Tab,
      activateAct1Tab,
      markAct1Filtered,
      setAct2Scenarios,
      observeAct2,
      resetAct1,
      resetAct2,
    }),
    [
      state,
      setAct1Scenarios,
      openAct1Tab,
      closeAct1Tab,
      activateAct1Tab,
      markAct1Filtered,
      setAct2Scenarios,
      observeAct2,
      resetAct1,
      resetAct2,
    ],
  );

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  );
}
