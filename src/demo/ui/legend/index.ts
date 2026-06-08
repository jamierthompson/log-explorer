export { Legend, type LegendItem } from "./legend";
/*
 * Re-export the sibling Keycap primitives via a relative path so this
 * folder plus `../keycap/` can be copied into another project without
 * dragging the app's `@/*` path alias along.
 */
export { Keycap, KeycapSequence } from "../keycap/keycap";
