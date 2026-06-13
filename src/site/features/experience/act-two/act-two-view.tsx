"use client";

import { useRouter } from "next/navigation";

import { mockLogs } from "@/demo";

import { useDemoState } from "../demo-state";
import { ActTwo } from "./act-two";

/** Act 2 wired into the demo segment: reading the story leaves the demo,
 * the guide's reset clears this act in place, and the dialog's replay
 * restarts the whole incident from Act 1. */
export function ActTwoView() {
  const router = useRouter();
  const { state, resetAct1, resetAct2 } = useDemoState();

  // Keyed on the act's run id so a reset remounts it, clearing the
  // explorer's internal filter — the checklist itself lives in the store
  // and is already cleared by the reset dispatch.
  return (
    <ActTwo
      key={state.act2.runId}
      lines={mockLogs}
      onReadStory={() => router.push("/story")}
      // The guide's reset clears this act in place — no navigation.
      onReset={resetAct2}
      // The dialog's "replay" restarts the whole incident from Act 1.
      onReplay={() => {
        resetAct1();
        resetAct2();
        router.push("/demo");
      }}
    />
  );
}
