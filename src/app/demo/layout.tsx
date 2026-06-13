import { DemoShell } from "@/site/features/experience/demo-shell";

export default function DemoLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <DemoShell>
      {children}
      {modal}
    </DemoShell>
  );
}
