"use client";

import { useRouter } from "next/navigation";

import { mockLogs } from "@/demo";

import { useDemoState } from "../demo-state";
import { ActOne } from "./act-one";

/** Act 1 wired into the demo segment: advancing routes to Act 2, and reset
 * starts the run over in place (the store clears and the explorer remounts
 * fresh). */
export function ActOneView() {
  const router = useRouter();
  const { state, resetAct1 } = useDemoState();

  // Keyed on the act's run id so a reset remounts it fresh, re-seeding the
  // explorer from the (now cleared) store.
  return (
    <ActOne
      key={state.act1.runId}
      lines={mockLogs}
      onAdvance={() => router.push("/demo/in-place")}
      onReset={resetAct1}
    />
  );
}
