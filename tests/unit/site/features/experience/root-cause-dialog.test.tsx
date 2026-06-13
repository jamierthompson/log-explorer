import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RootCauseDialog } from "@/site/features/experience/root-cause/root-cause-dialog";

describe("RootCauseDialog", () => {
  it("names and describes itself from the live question, then the verdict", async () => {
    const user = userEvent.setup();
    render(<RootCauseDialog onClose={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName(/what was the root cause/i);
    expect(dialog).toHaveAccessibleDescription(/make the call/i);

    await user.click(screen.getByRole("button", { name: /config reload/i }));
    // The verdict relabels the dialog and names the picked cause.
    const verdict = screen.getByRole("dialog");
    expect(verdict).toHaveAccessibleName(/root cause found/i);
    expect(verdict).toHaveAccessibleDescription(/config reload/i);
  });

  it("closes when dismissed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RootCauseDialog onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("focuses the verdict heading through the injected dialog title", async () => {
    const user = userEvent.setup();
    render(<RootCauseDialog onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /config reload/i }));
    // The panel's focus ref has to forward through Radix's Dialog.Title here,
    // not just a plain heading, for the outcome to be announced.
    expect(
      screen.getByRole("heading", { name: "Root cause found" }),
    ).toHaveFocus();
  });
});
