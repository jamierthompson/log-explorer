"use client";

import { useRouter } from "next/navigation";

import { mockLogs } from "@/demo";

import { useDemoState } from "../demo-state";
import { ROOT_CAUSE_PATH } from "../root-cause/route";
import { ActTwo } from "./act-two";

/** Act 2 wired into the demo segment: the guide's reset clears this act in
 * place, and the closing action navigates to the root-cause call's own
 * route. */
export function ActTwoView() {
  const router = useRouter();
  const { state, resetAct2 } = useDemoState();

  // Keyed on the act's run id so a reset remounts it, clearing the
  // explorer's internal filter — the checklist itself lives in the store
  // and is already cleared by the reset dispatch.
  return (
    <ActTwo
      key={state.act2.runId}
      lines={mockLogs}
      onReset={resetAct2}
      onCallRootCause={() => router.push(ROOT_CAUSE_PATH)}
    />
  );
}
