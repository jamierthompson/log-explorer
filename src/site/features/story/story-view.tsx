"use client";

import { useRouter } from "next/navigation";

import { Story } from "./story";

/** Routes the story's calls to action into the demo. */
export function StoryView() {
  const router = useRouter();
  return <Story onOpenDemo={() => router.push("/demo")} />;
}
