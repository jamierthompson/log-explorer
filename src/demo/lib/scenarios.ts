import type { ScenarioPreset } from "@/demo/lib/filter-state";

/* Lives outside the chips component (which is `"use client"`) so that
 * Server Components can import the data directly. Importing data
 * exports across the client boundary turns them into client-reference
 * proxies, not the actual values. */
/* Labels mirror how the log lines render their facets, so a chip reads
 * as "filter to lines that look like this". The hints carry the
 * investigative reason to reach for each one. */
export const SCENARIOS = [
  {
    id: "errors",
    label: "Errors only",
    hint: "Start with what's broken",
    scenario: { instances: [], requestIds: [], levels: ["ERROR"] },
  },
  {
    id: "trace",
    label: "req=r4d8a2",
    hint: "The failing checkout request",
    scenario: { instances: [], requestIds: ["r4d8a2"], levels: [] },
  },
  {
    id: "instance",
    label: "@kc4qn",
    hint: "The instance throwing 503s",
    scenario: { instances: ["kc4qn"], requestIds: [], levels: [] },
  },
] as const satisfies readonly ScenarioPreset[];
