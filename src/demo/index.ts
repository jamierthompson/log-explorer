/**
 * Public API for the demo — the surface that will become the npm package.
 * Consumers (the site) import from here, never from internal paths.
 */
export { LogExplorer } from "./features/log-explorer/log-explorer";
export type { LogExplorerSnapshot } from "./features/log-explorer/log-explorer-state";
/**
 * The bare, read-only log row — for composing slices outside the explorer.
 * Self-contained: it carries the demo's surface marker, scoped reset,
 * tokens, and typeface, so it renders correctly under any host styling.
 */
export { LogLine as LogRow } from "./features/log-explorer/log-line";
/** Format a line's timestamp the same way the explorer's rows do. */
export { formatTime as formatLogTime } from "./lib/format-timestamp";
export { Legend, type LegendItem } from "./ui/legend/legend";
export { Keycap, KeycapSequence } from "./ui/keycap/keycap";
export type { LogLine } from "./types/log";
export type { FilterState } from "./lib/filter-state";
export { mockLogs } from "./mocks/logs";
export { SCENARIOS } from "./lib/scenarios";
