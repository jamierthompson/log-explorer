import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { LogLine } from "@/demo";
import { ActTwo } from "@/site/features/experience/act-two/act-two";

import { getGuideStep } from "../../../../helpers/experience-dom";

const lines: readonly LogLine[] = [
  {
    id: "1",
    timestamp: 0,
    instance: "kc4qn",
    level: "INFO",
    message: "Healthcheck OK",
  },
  {
    id: "2",
    timestamp: 1,
    instance: "m7w3p",
    level: "ERROR",
    message: "request timeout",
  },
  {
    id: "3",
    timestamp: 2,
    instance: "kc4qn",
    level: "INFO",
    message: "GET /api/users",
    requestId: "r4d8a2",
  },
  {
    id: "4",
    timestamp: 3,
    instance: "t2x8r",
    level: "ERROR",
    message: "upstream timeout",
  },
];

describe("ActTwo", () => {
  it("opens the root-cause call, which is always available", async () => {
    const user = userEvent.setup();
    render(<ActTwo lines={lines} />);

    const call = screen.getByRole("button", { name: /call the root cause/i });
    expect(call).toBeEnabled();

    await user.click(call);
    expect(
      screen.getByRole("dialog", { name: /what was the root cause/i }),
    ).toBeInTheDocument();
  });

  it("checks off the guide as the visitor filters and opens context", async () => {
    const user = userEvent.setup();
    render(<ActTwo lines={lines} />);

    const triage = getGuideStep("triage");
    const context = getGuideStep("context");
    expect(triage).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(triage).toHaveAttribute("data-done");

    await user.click(screen.getByText("request timeout"));
    expect(context).toHaveAttribute("data-done");
  });

  it("closes the verdict dialog when leaving for the story", async () => {
    const user = userEvent.setup();
    const onReadStory = vi.fn();
    render(<ActTwo lines={lines} onReadStory={onReadStory} />);

    await user.click(
      screen.getByRole("button", { name: /call the root cause/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /config reload shrank/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /read how it was built/i }),
    );

    expect(onReadStory).toHaveBeenCalledOnce();
    // The act is only hidden on navigation, so a dialog left open would
    // float over the story view.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("latches the blast-radius step across contexts opened one at a time", async () => {
    const user = userEvent.setup();
    render(<ActTwo lines={lines} />);

    const radius = getGuideStep("radius");
    await user.click(screen.getByRole("button", { name: /errors only/i }));

    // Open a context, then close it the way the explorer teaches —
    // one place examined isn't a blast radius yet.
    await user.click(screen.getByText("request timeout"));
    await user.click(screen.getByText("request timeout"));
    expect(radius).not.toHaveAttribute("data-done");

    // Opening another context elsewhere completes the comparison, even
    // though the two were never open at the same time.
    await user.click(screen.getByText("upstream timeout"));
    expect(radius).toHaveAttribute("data-done");
  });
});
