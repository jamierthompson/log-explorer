import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RootCauseDialog } from "@/site/features/experience/root-cause-dialog/root-cause-dialog";

describe("RootCauseDialog", () => {
  it("celebrates the correct cause and offers the story and a replay", async () => {
    const user = userEvent.setup();
    const onReplay = vi.fn();
    const onReadStory = vi.fn();
    render(
      <RootCauseDialog
        open
        onOpenChange={vi.fn()}
        onReplay={onReplay}
        onReadStory={onReadStory}
      />,
    );

    expect(screen.getByText("What was the root cause?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /config reload/i }));

    expect(screen.getByText("Root cause found")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /read how it was built/i }),
    );
    expect(onReadStory).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole("button", { name: /replay the incident/i }),
    );
    expect(onReplay).toHaveBeenCalledOnce();
  });

  it("omits the onward actions when no callbacks are provided", async () => {
    const user = userEvent.setup();
    render(<RootCauseDialog open onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /config reload/i }));

    expect(screen.getByText("Root cause found")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /read how it was built/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /replay the incident/i }),
    ).not.toBeInTheDocument();
  });

  it("focuses the verdict heading so the outcome is read aloud", async () => {
    const user = userEvent.setup();
    render(<RootCauseDialog open onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /config reload/i }));

    expect(
      screen.getByRole("heading", { name: "Root cause found" }),
    ).toHaveFocus();
  });

  it("nudges gently on a wrong cause and lets the visitor reconsider", async () => {
    const user = userEvent.setup();
    render(<RootCauseDialog open onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /database is down/i }));

    // Encouraging, not a verdict of failure.
    expect(screen.getByText("Keep looking")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reconsider/i }));
    // Back to the full slate of suspects.
    expect(screen.getByText("What was the root cause?")).toBeInTheDocument();
  });
});
