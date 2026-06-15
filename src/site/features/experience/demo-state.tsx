"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type { OpenContext } from "@/demo";

/** The scattered context slices of the old way: which lines are open (by
 * id) and which tab is showing (null means the live tail). */
type Tabs = {
  readonly ids: readonly string[];
  readonly active: string | null;
};

/** The investigation's sticky checklist — each step latches the first
 * time the explorer reports it and never un-latches. */
type Progress = {
  readonly triaged: boolean;
  readonly traced: boolean;
  readonly context: boolean;
  readonly radius: boolean;
};

/** The steps seen true in a single snapshot — transient readings, not
 * authoritative progress. The reducer folds these into the sticky
 * Progress, so a false reading here can't clear a latched step. */
type ProgressSignals = Progress;

/* One investigation, shared across the whole demo. `runId` bumps on reset
 * so the view remounts and the explorer's internal filter — which can't be
 * cleared any other way — starts over. The filter (scenarioIds), the
 * scattered tabs of the old way, the stacked in-place contexts, and the
 * checklist all live here, so they survive in-app navigation and reset
 * together as one investigation. */
type DemoState = {
  readonly runId: number;
  readonly scenarioIds: readonly string[];
  readonly everFiltered: boolean;
  readonly tabs: Tabs;
  readonly openContexts: readonly OpenContext[];
  readonly progress: Progress;
};

const INITIAL_STATE: DemoState = {
  runId: 0,
  scenarioIds: [],
  everFiltered: false,
  tabs: { ids: [], active: null },
  openContexts: [],
  progress: { triaged: false, traced: false, context: false, radius: false },
};

type Action =
  | { type: "filter"; scenarioIds: readonly string[] }
  | { type: "openTab"; id: string }
  | { type: "closeTab"; id: string }
  | { type: "activateTab"; active: string | null }
  | { type: "markFiltered" }
  | { type: "contexts"; openContexts: readonly OpenContext[] }
  | { type: "observe"; observed: ProgressSignals }
  | { type: "reset" };

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "filter":
      return { ...state, scenarioIds: action.scenarioIds };
    case "openTab": {
      const open = state.tabs.ids.includes(action.id);
      const ids = open ? state.tabs.ids : [...state.tabs.ids, action.id];
      return { ...state, tabs: { ids, active: action.id } };
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
      return { ...state, progress: next };
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
      reset,
    ],
  );

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  );
}
