import type { Metadata } from "next";

import { StoryView } from "@/site/features/story/story-view";
import { SITE_NAME } from "@/site/lib/site-meta";

export const metadata: Metadata = {
  title: `Story — ${SITE_NAME}`,
};

export default function StoryPage() {
  return <StoryView />;
}
