import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ShortcutSheet } from "@/demo/features/shortcut-sheet/shortcut-sheet";
import { SHORTCUTS, SHORTCUT_GROUPS } from "@/demo/lib/keyboard-shortcuts";

describe("ShortcutSheet", () => {
  it("renders nothing when closed", () => {
    render(<ShortcutSheet open={false} onOpenChange={() => {}} />);
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });

  it("renders every group title when open", () => {
    render(<ShortcutSheet open={true} onOpenChange={() => {}} />);
    for (const group of SHORTCUT_GROUPS) {
      expect(screen.getByText(group.title)).toBeInTheDocument();
    }
  });

  it("renders every shortcut description when open", () => {
    render(<ShortcutSheet open={true} onOpenChange={() => {}} />);
    for (const id of Object.keys(SHORTCUTS) as Array<keyof typeof SHORTCUTS>) {
      expect(screen.getByText(SHORTCUTS[id].description)).toBeInTheDocument();
    }
  });

  it("calls onOpenChange(false) when Esc is pressed", async () => {
    const onOpenChange = vi.fn();
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<ShortcutSheet open={true} onOpenChange={onOpenChange} />);
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
