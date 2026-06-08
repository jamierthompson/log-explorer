import { mockLogs, SCENARIOS } from "@/demo";
import { LandingExperience } from "@/site/features/landing/landing-experience";

/* Pre-applies the trace scenario on first paint so the demo opens
 * already filtered, showing the affordance immediately instead of
 * asking the reader to discover it. */
const INITIAL_DEMO_FILTER = SCENARIOS.find((s) => s.id === "trace")?.scenario;

export default function Home() {
  return (
    <LandingExperience lines={mockLogs} initialFilter={INITIAL_DEMO_FILTER} />
  );
}
