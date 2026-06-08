import type { ScenarioPreset } from "@/lib/filter-state";

/* Lives outside the chips component (which is `"use client"`) so that
 * Server Components can import the data directly. Importing data
 * exports across the client boundary turns them into client-reference
 * proxies, not the actual values. */
export const SCENARIOS = [
  {
    id: "errors",
    label: "Errors only",
    scenario: { instances: [], requestIds: [], levels: ["ERROR"] },
  },
  {
    id: "trace",
    label: "Trace req=r4d8a2",
    scenario: { instances: [], requestIds: ["r4d8a2"], levels: [] },
  },
  {
    id: "instance",
    label: "Instance kc4qn",
    scenario: { instances: ["kc4qn"], requestIds: [], levels: [] },
  },
] as const satisfies readonly ScenarioPreset[];
