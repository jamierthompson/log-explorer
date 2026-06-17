"use client";

import { useRouter } from "next/navigation";

import { mockLogs } from "@/demo";

import { useDemoState } from "../demo-state";
import { ROOT_CAUSE_PATH } from "../root-cause/route";
import { Investigation } from "./investigation";

/** The single staged demo wired into the route: the cut happens in place
 * (no navigation), reset clears the whole investigation and remounts it
 * fresh, and the closing action routes to the root-cause call. */
export function InvestigationView() {
  const router = useRouter();
  const { state, reset } = useDemoState();

  // Keyed on the investigation's run id so a reset remounts it fresh —
  // clearing the explorer's internal filter and returning to act one.
  return (
    <Investigation
      key={state.runId}
      lines={mockLogs}
      onReset={reset}
      onCallRootCause={() => router.push(ROOT_CAUSE_PATH)}
    />
  );
}
