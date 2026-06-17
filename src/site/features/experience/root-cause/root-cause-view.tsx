"use client";

import { useRouter } from "next/navigation";

import { useDemoState } from "@/site/features/experience/demo-state";

import { ActHeader } from "../act-header/act-header";
import { RootCausePanel } from "./root-cause-panel";
import styles from "./root-cause-view.module.css";

/** The root-cause call — the finale that closes the two acts, reached from
 * Act 2's "Call the root cause" action. It wears the acts' header and a
 * two-column body so it reads as the close of the sequence, not a dialog
 * dropped on the page. */
export function RootCauseView() {
  const router = useRouter();
  const { reset } = useDemoState();

  return (
    <div className={styles.page}>
      <ActHeader
        step="03"
        kicker="The call"
        title="You’ve followed it through. What put it there?"
      />
      <RootCausePanel
        onReadStory={() => router.push("/story")}
        onReplay={() => {
          reset();
          router.push("/demo");
        }}
      />
    </div>
  );
}
