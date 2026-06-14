import { DemoShell } from "@/site/features/experience/demo-shell";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoShell>{children}</DemoShell>;
}
