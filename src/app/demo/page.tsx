import { LogExplorer } from "@/components/features/log-explorer/log-explorer";
import { mockLogs } from "@/mocks/logs";

export default function DemoPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LogExplorer lines={mockLogs.toReversed()} />
    </main>
  );
}
