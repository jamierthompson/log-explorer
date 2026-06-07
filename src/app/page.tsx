import { LandingExperience } from "@/components/features/landing/landing-experience";
import { SCENARIOS } from "@/lib/scenarios";
import { mockLogs } from "@/mocks/logs";

/* Pre-applies the trace scenario on first paint so the demo opens
 * already filtered, showing the affordance immediately instead of
 * asking the reader to discover it. */
const INITIAL_DEMO_FILTER = SCENARIOS.find((s) => s.id === "trace")?.scenario;

export default function Home() {
  return (
    <LandingExperience lines={mockLogs} initialFilter={INITIAL_DEMO_FILTER} />
  );
}
