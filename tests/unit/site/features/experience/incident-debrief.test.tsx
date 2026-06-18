import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IncidentDebrief } from "@/site/features/experience/incident-debrief/incident-debrief";

const noop = () => {};

describe("IncidentDebrief", () => {
  it("renders nothing until it is opened", () => {
    render(<IncidentDebrief open={false} onOpenChange={noop} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("narrates the incident and offers the story and a replay when open", async () => {
    const user = userEvent.setup();
    const onReadStory = vi.fn();
    const onReplay = vi.fn();
    render(
      <IncidentDebrief
        open
        onOpenChange={noop}
        onReadStory={onReadStory}
        onReplay={onReplay}
      />,
    );

    // The sign-off names the cause, not just the symptom, and lands the
    // line the whole demo was built around.
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/config reload/i);
    expect(dialog).toHaveTextContent(/in the lines around it/i);

    await user.click(
      screen.getByRole("button", { name: /read how it was built/i }),
    );
    expect(onReadStory).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole("button", { name: /replay the incident/i }),
    );
    expect(onReplay).toHaveBeenCalledOnce();
  });
});
