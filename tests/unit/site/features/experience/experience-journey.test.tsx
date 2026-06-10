import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { mockLogs } from "@/demo";
import { Experience } from "@/site/features/experience/experience";

import { getAct, getGuideStep } from "../../../../helpers/experience-dom";

afterEach(() => {
  window.history.replaceState(null, "", window.location.pathname);
});

/*
 * The full guided journey, end to end, against the real mock incident:
 * Act 1's scatter, Act 2's investigation, a wrong call, the right
 * call, and a replay that must land on a genuinely fresh run.
 */
describe("Experience replay loop", () => {
  // Dozens of user events over the full mock stream need headroom
  // beyond the default budget when the worker pool is loaded.
  it(
    "drives both acts to done, calls the cause, and replays into a fresh Act 1",
    {
      timeout: 20_000,
    },
    async () => {
      const user = userEvent.setup();
      render(<Experience lines={mockLogs} />);
      const act1 = within(getAct("act1"));

      // Act 1 — filter the tail, then scatter context across two tabs.
      await user.click(act1.getByRole("button", { name: /errors only/i }));
      await user.click(
        act1.getByText("checkout failed: db pool timeout after 5000ms"),
      );
      // Opening a slice steals the stage; return to the tail to open more.
      await user.click(act1.getByRole("tab", { name: "Live tail" }));
      await user.click(
        act1.getByText("add-to-cart failed: db pool timeout after 5000ms"),
      );
      expect(getGuideStep("filter")).toHaveAttribute("data-done");
      expect(getGuideStep("open")).toHaveAttribute("data-done");
      expect(getGuideStep("pile")).toHaveAttribute("data-done");

      await user.click(act1.getByRole("button", { name: /better way/i }));
      expect(getAct("act2")).toBeVisible();
      const act2 = within(getAct("act2"));

      // Act 2 — triage, trace, then open context in two places; the
      // second opening earns the blast-radius step without the instance
      // filter.
      await user.click(act2.getByRole("button", { name: /errors only/i }));
      await user.click(act2.getByRole("button", { name: /req=r4d8a2/i }));
      await user.click(
        act2.getByText("checkout failed: db pool timeout after 5000ms"),
      );
      await user.click(
        act2.getByText("checkout retry failed: db pool timeout after 5000ms"),
      );
      expect(getGuideStep("triage")).toHaveAttribute("data-done");
      expect(getGuideStep("trace")).toHaveAttribute("data-done");
      expect(getGuideStep("context")).toHaveAttribute("data-done");
      expect(getGuideStep("radius")).toHaveAttribute("data-done");

      // The call: a wrong answer invites a retry; the right one ends the
      // run. (The dialog portals to the body, hence the unscoped queries.)
      await user.click(
        act2.getByRole("button", { name: /call the root cause/i }),
      );
      await user.click(
        screen.getByRole("button", { name: /database is down/i }),
      );
      expect(screen.getByText("Keep looking")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /reconsider/i }));
      await user.click(screen.getByRole("button", { name: /config reload/i }));
      expect(screen.getByText("Root cause found")).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: /replay the incident/i }),
      );

      // A fresh run: Act 1 on stage, no step checked anywhere, the tail
      // unfiltered, and keyboard focus already inside the act.
      expect(getAct("act1")).toBeVisible();
      expect(getAct("act2")).not.toBeVisible();
      expect(
        document.querySelectorAll("[data-guide-step][data-done]"),
      ).toHaveLength(0);
      expect(
        within(getAct("act1")).getByRole("button", { name: /errors only/i }),
      ).toHaveAttribute("aria-pressed", "false");
      expect(getAct("act1")).toHaveFocus();
    },
  );
});
