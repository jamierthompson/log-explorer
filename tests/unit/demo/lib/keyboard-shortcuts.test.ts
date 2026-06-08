import { describe, expect, it } from "vitest";

import {
  SHORTCUTS,
  SHORTCUT_GROUPS,
  type ShortcutId,
} from "@/demo/lib/keyboard-shortcuts";

describe("keyboard-shortcuts registry", () => {
  it("defines a description and at least one key cap for every entry", () => {
    for (const id of Object.keys(SHORTCUTS) as ShortcutId[]) {
      const def = SHORTCUTS[id];
      expect(def.keys.length, `${id} keys`).toBeGreaterThan(0);
      expect(def.description, `${id} description`).not.toBe("");
    }
  });

  it("every grouped id resolves to a registry entry", () => {
    const all = SHORTCUT_GROUPS.flatMap((g) => g.ids);
    for (const id of all) {
      expect(SHORTCUTS[id], `${id} should be in SHORTCUTS`).toBeDefined();
    }
  });

  it("groups cover every shortcut without duplicates", () => {
    const all = SHORTCUT_GROUPS.flatMap((g) => g.ids);
    expect(new Set(all).size).toBe(all.length);
    expect(new Set(all)).toEqual(new Set(Object.keys(SHORTCUTS)));
  });
});
