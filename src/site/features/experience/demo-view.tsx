"use client";

import { useRouter } from "next/navigation";

import { mockLogs } from "@/demo";

import { Experience } from "./experience";
import styles from "./demo-view.module.css";

/** The demo section: frames the guided experience in the page layout and
 * routes its "read the story" exit into the long-form view. */
export function DemoView() {
  const router = useRouter();
  return (
    <div className={styles.demoView}>
      <div className={styles.demoInner}>
        <Experience
          lines={mockLogs}
          onReadStory={() => router.push("/story")}
        />
      </div>
    </div>
  );
}
