import type { Metadata } from "next";

import { DemoView } from "@/site/features/experience/demo-view";
import { SITE_NAME } from "@/site/lib/site-meta";

export const metadata: Metadata = {
  title: `Demo — ${SITE_NAME}`,
};

export default function DemoPage() {
  return <DemoView />;
}
