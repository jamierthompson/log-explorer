import type { Metadata } from "next";

import { InvestigationView } from "@/site/features/experience/investigation/investigation-view";
import { SITE_NAME } from "@/site/lib/site-meta";

export const metadata: Metadata = {
  title: `Demo — ${SITE_NAME}`,
};

export default function DemoPage() {
  return <InvestigationView />;
}
