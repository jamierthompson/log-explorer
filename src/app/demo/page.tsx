import type { Metadata } from "next";

import { ActOneView } from "@/site/features/experience/act-one/act-one-view";
import { SITE_NAME } from "@/site/lib/site-meta";

export const metadata: Metadata = {
  title: `Demo — ${SITE_NAME}`,
};

export default function DemoPage() {
  return <ActOneView />;
}
