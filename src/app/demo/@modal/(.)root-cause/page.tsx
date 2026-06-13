"use client";

import { usePathname, useRouter } from "next/navigation";

import { useDemoState } from "@/site/features/experience/demo-state";
import { RootCauseDialog } from "@/site/features/experience/root-cause/root-cause-dialog";
import { ROOT_CAUSE_PATH } from "@/site/features/experience/root-cause/route";

/** Intercepts an in-app navigation to the root-cause call and renders it as
 * a modal over the Act 2 evidence; dismissing returns to that act. */
export default function RootCauseModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { resetAct1, resetAct2 } = useDemoState();

  // A parallel slot keeps its last content on soft navigation, so render
  // nothing once the path has moved on — that's what lets the modal's own
  // navigations (replay, read the story) actually dismiss it.
  if (pathname !== ROOT_CAUSE_PATH) return null;

  return (
    <RootCauseDialog
      onClose={() => router.back()}
      onReadStory={() => router.push("/story")}
      onReplay={() => {
        resetAct1();
        resetAct2();
        router.push("/demo");
      }}
    />
  );
}
