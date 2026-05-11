import { LogList } from "@/components/features/log-explorer/log-list";
import { mockLogs } from "@/mocks/logs";

export default function DemoPage() {
  return (
    <main>
      <LogList lines={mockLogs} />
    </main>
  );
}
