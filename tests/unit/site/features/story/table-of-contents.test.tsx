import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TableOfContents } from "@/site/features/story/table-of-contents";
import { STORY_SECTIONS } from "@/site/features/story/story-sections";

import { mockMatchMedia } from "../../../../helpers/match-media";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TableOfContents", () => {
  it("lists every story section", () => {
    render(<TableOfContents />);
    for (const section of STORY_SECTIONS) {
      expect(
        screen.getByRole("button", { name: section.label }),
      ).toBeInTheDocument();
    }
  });

  it("marks a clicked entry as the current section", async () => {
    const user = userEvent.setup();
    // Force the reduced-motion branch so the jump is synchronous in jsdom.
    mockMatchMedia(true);
    const first = STORY_SECTIONS[0];
    const target = document.createElement("section");
    target.id = first.id;
    document.body.appendChild(target);
    render(<TableOfContents />);

    const entry = screen.getByRole("button", { name: first.label });
    expect(entry).not.toHaveAttribute("aria-current");

    await user.click(entry);
    expect(entry).toHaveAttribute("aria-current", "true");

    target.remove();
  });

  it("moves focus to the section a jump lands on", async () => {
    const user = userEvent.setup();
    // Force the reduced-motion branch so the jump is synchronous in jsdom.
    mockMatchMedia(true);
    const first = STORY_SECTIONS[0];
    const target = document.createElement("section");
    target.id = first.id;
    target.tabIndex = -1;
    document.body.appendChild(target);
    render(<TableOfContents />);

    await user.click(screen.getByRole("button", { name: first.label }));

    // Reading continues from the jump target, not from the contents list.
    expect(target).toHaveFocus();
    target.remove();
  });
});
