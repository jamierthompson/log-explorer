import { mockLogs } from "@/demo";
import { Landing } from "@/site/features/landing/landing";

export default function Home() {
  return <Landing lines={mockLogs} />;
}
