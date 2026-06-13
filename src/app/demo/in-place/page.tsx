import type { Metadata } from "next";

import { ActTwoView } from "@/site/features/experience/act-two/act-two-view";
import { SITE_NAME } from "@/site/lib/site-meta";

export const metadata: Metadata = {
  title: `In place — ${SITE_NAME}`,
};

export default function InPlacePage() {
  return <ActTwoView />;
}
