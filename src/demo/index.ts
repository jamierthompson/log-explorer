/**
 * Public API for the demo — the surface that will become the npm package.
 * Consumers (the site) import from here, never from internal paths.
 */
export { LogExplorer } from "./features/log-explorer/log-explorer";
export { Legend, type LegendItem } from "./ui/legend/legend";
export { Keycap, KeycapSequence } from "./ui/keycap/keycap";
export type { LogLine } from "./types/log";
export type { FilterState } from "./lib/filter-state";
export { mockLogs } from "./mocks/logs";
export { SCENARIOS } from "./lib/scenarios";
