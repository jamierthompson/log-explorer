import type { Metadata } from "next";

import { RootCauseView } from "@/site/features/experience/root-cause/root-cause-view";
import { SITE_NAME } from "@/site/lib/site-meta";

export const metadata: Metadata = {
  title: `Root cause — ${SITE_NAME}`,
};

export default function RootCausePage() {
  return <RootCauseView />;
}
