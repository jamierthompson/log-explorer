import { LogExplorer } from "@/components/features/log-explorer/log-explorer";
import { mockLogs } from "@/mocks/logs";

export default function DemoPage() {
  return (
    <main>
      <LogExplorer lines={mockLogs} />
    </main>
  );
}
