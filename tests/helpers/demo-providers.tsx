import type { ReactNode } from "react";

import { DemoShell } from "@/site/features/experience/demo-shell";
import { DemoStateProvider } from "@/site/features/experience/demo-state";

/**
 * Wraps a demo component in the contexts it reads — the persistent store
 * and the live-region announcer — for use as a Testing Library `wrapper`.
 * Each render gets a fresh store, so tests stay isolated.
 */
export function DemoProviders({ children }: { children: ReactNode }) {
  return (
    <DemoStateProvider>
      <DemoShell>{children}</DemoShell>
    </DemoStateProvider>
  );
}
