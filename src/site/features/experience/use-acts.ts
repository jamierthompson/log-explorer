"use client";

import { useCallback, useEffect, useState } from "react";

export type Act = "act1" | "act2";

/*
 * Identifies this page load. The act marker only counts when stamped
 * with the current id, so a marked entry that survived in the browser's
 * history from a previous load (advance, back, reload, forward) reads
 * as Act 1 instead of fast-forwarding a fresh session into Act 2.
 */
const SESSION_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

type ActMarker = { act?: string; actSession?: string };

function actFromState(state: unknown): Act {
  const marker = state as ActMarker | null;
  return marker?.act === "act2" && marker.actSession === SESSION_ID
    ? "act2"
    : "act1";
}

/**
 * Sequences the guided experience. Advancing to Act 2 pushes a history
 * entry, so the browser back button returns to Act 1 (and forward restores
 * Act 2) within a session. A fresh page load always starts on Act 1: the
 * act is held in local state seeded to Act 1, and a marker only counts
 * when stamped by the current load, so neither a reload nor forward
 * navigation onto an entry marked by a previous load can drop the
 * visitor mid-experience.
 */
export function useActs(): {
  act: Act;
  advance: () => void;
  reset: () => void;
} {
  const [act, setAct] = useState<Act>("act1");

  /*
   * Invariant for every history write in this hook: start from the
   * entry's existing state (spread, never a fresh object) and only add
   * or remove the act marker. Other parties — the framework router and
   * the hash router — keep their own keys in history.state, and a write
   * that drops them breaks their navigation bookkeeping.
   */
  const clearMarker = useCallback(() => {
    const current = window.history.state as ActMarker | null;
    if (current?.act === undefined && current?.actSession === undefined) {
      return;
    }
    const state = { ...current };
    delete state.act;
    delete state.actSession;
    window.history.replaceState(state, "", window.location.href);
  }, []);

  useEffect(() => {
    // Scrub a marker carried over from a reload so the current entry
    // starts clean; markers on other entries stay inert anyway because
    // their session stamp no longer matches this load.
    clearMarker();
  }, [clearMarker]);

  useEffect(() => {
    // Within a session, honor browser back/forward between the acts. An
    // entry marked by a previous load reads as Act 1 and is scrubbed
    // here, so revisiting it can never resurrect that load's Act 2.
    const onPop = () => {
      const next = actFromState(window.history.state);
      if (next === "act1") clearMarker();
      setAct(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [clearMarker]);

  const advance = useCallback(() => {
    const state = {
      ...(window.history.state ?? {}),
      act: "act2",
      actSession: SESSION_ID,
    };
    window.history.pushState(state, "", window.location.href);
    setAct("act2");
  }, []);

  // Return to Act 1 deliberately (replay), dropping the act marker so
  // forward navigation can't jump back into Act 2.
  const reset = useCallback(() => {
    clearMarker();
    setAct("act1");
  }, [clearMarker]);

  return { act, advance, reset };
}
