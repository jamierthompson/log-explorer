"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { mockLogs } from "@/demo";

import { IncidentDebrief } from "../incident-debrief/incident-debrief";
import { useDemoState } from "../demo-state";
import { Investigation } from "./investigation";

/** The single staged demo wired into the route: the cut happens in place
 * (no navigation), reset clears the whole investigation and remounts it
 * fresh, and the closing action opens the incident debrief over it — also
 * in place, so the demo stays on one surface from act one to the close. */
export function InvestigationView() {
  const router = useRouter();
  const { state, reset } = useDemoState();
  const [debriefOpen, setDebriefOpen] = useState(false);

  return (
    <>
      {/* Keyed on the investigation's run id so a reset remounts it fresh —
          clearing the explorer's internal filter and returning to act one. */}
      <Investigation
        key={state.runId}
        lines={mockLogs}
        onReset={reset}
        onConclude={() => setDebriefOpen(true)}
      />
      <IncidentDebrief
        open={debriefOpen}
        onOpenChange={setDebriefOpen}
        onReadStory={() => router.push("/story")}
        onReplay={() => {
          setDebriefOpen(false);
          reset();
        }}
      />
    </>
  );
}
