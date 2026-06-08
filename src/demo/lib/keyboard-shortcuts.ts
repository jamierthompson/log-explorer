/*
 * Single source of truth for every keyboard binding in the demo.
 *
 *   keys        primary cap labels rendered as adjacent keycaps
 *   aliases     additional cap sequences shown after the primary in
 *               the shortcut sheet
 *   description short, action-style sentence for the sheet's row
 *
 * The Legend reads `keys` by id so its keycaps and the sheet's never
 * disagree on what a binding looks like. Legend labels stay local to
 * the call site because they're contextual ("View context" vs "Hide
 * context") in a way a single description can't express.
 */
export type ShortcutId =
  | "navigateNext"
  | "navigatePrev"
  | "navigateFirst"
  | "navigateLast"
  | "navigateNextAnchor"
  | "navigatePrevAnchor"
  | "toggleContext"
  | "expandContext"
  | "closeRecent"
  | "closeAll"
  | "openShortcuts";

export type ShortcutDef = {
  readonly keys: readonly string[];
  readonly aliases?: readonly (readonly string[])[];
  readonly description: string;
};

export const SHORTCUTS = {
  navigateNext: {
    keys: ["J"],
    aliases: [["↓"]],
    description: "Next visible line",
  },
  navigatePrev: {
    keys: ["K"],
    aliases: [["↑"]],
    description: "Previous visible line",
  },
  navigateFirst: {
    keys: ["G"],
    description: "Jump to first line",
  },
  navigateLast: {
    keys: ["Shift", "G"],
    description: "Jump to last line",
  },
  navigateNextAnchor: {
    keys: ["]"],
    description: "Next open context anchor",
  },
  navigatePrevAnchor: {
    keys: ["["],
    description: "Previous open context anchor",
  },
  toggleContext: {
    keys: ["E"],
    aliases: [["Enter"]],
    description: "View or hide context on focused line",
  },
  expandContext: {
    keys: ["Shift", "E"],
    description: "Expand most-recent context",
  },
  closeRecent: {
    keys: ["Esc"],
    description: "Close most-recent context or clear filter",
  },
  closeAll: {
    keys: ["Shift", "Esc"],
    description: "Close every open context",
  },
  openShortcuts: {
    keys: ["?"],
    description: "Show keyboard shortcuts",
  },
} as const satisfies Record<ShortcutId, ShortcutDef>;

export type ShortcutGroup = {
  readonly title: string;
  readonly ids: readonly ShortcutId[];
};

export const SHORTCUT_GROUPS = [
  {
    title: "Navigation",
    ids: [
      "navigateNext",
      "navigatePrev",
      "navigateFirst",
      "navigateLast",
      "navigateNextAnchor",
      "navigatePrevAnchor",
    ],
  },
  {
    title: "Context",
    ids: ["toggleContext", "expandContext", "closeRecent", "closeAll"],
  },
  {
    title: "Help",
    ids: ["openShortcuts"],
  },
] as const satisfies readonly ShortcutGroup[];
