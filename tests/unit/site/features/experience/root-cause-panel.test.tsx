import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RootCausePanel } from "@/site/features/experience/root-cause/root-cause-panel";

describe("RootCausePanel", () => {
  it("reveals the verdict for the correct cause and offers the story and a replay", async () => {
    const user = userEvent.setup();
    const onReplay = vi.fn();
    const onReadStory = vi.fn();
    render(<RootCausePanel onReplay={onReplay} onReadStory={onReadStory} />);

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
    render(<RootCausePanel />);

    await user.click(screen.getByRole("button", { name: /config reload/i }));
    expect(screen.getByText("Root cause found")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /read how it was built/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /replay the incident/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps the choices in place so a miss is corrected by picking again", async () => {
    const user = userEvent.setup();
    render(<RootCausePanel />);

    await user.click(screen.getByRole("button", { name: /database is down/i }));
    // A miss nudges rather than failing, and the choices stay put — no
    // backing out of a swapped view to try another.
    expect(screen.getByText("Keep looking")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /reconsider/i }),
    ).not.toBeInTheDocument();

    // Picking the right cause from the still-present choices settles it.
    await user.click(screen.getByRole("button", { name: /config reload/i }));
    expect(screen.getByText("Root cause found")).toBeInTheDocument();
  });
});
