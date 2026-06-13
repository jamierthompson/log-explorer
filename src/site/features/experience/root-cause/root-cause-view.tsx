"use client";

import { useRouter } from "next/navigation";

import { useDemoState } from "@/site/features/experience/demo-state";

import { RootCausePanel } from "./root-cause-panel";
import styles from "./root-cause-view.module.css";

/** The root-cause call as a standalone page — what a direct hit or refresh
 * on the route lands on, since the modal interception only runs for in-app
 * navigation. */
export function RootCauseView() {
  const router = useRouter();
  const { resetAct1, resetAct2 } = useDemoState();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <RootCausePanel
          onReadStory={() => router.push("/story")}
          onReplay={() => {
            resetAct1();
            resetAct2();
            router.push("/demo");
          }}
        />
      </div>
    </div>
  );
}
