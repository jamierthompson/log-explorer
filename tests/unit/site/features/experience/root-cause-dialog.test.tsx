import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RootCauseDialog } from "@/site/features/experience/root-cause-dialog/root-cause-dialog";

describe("RootCauseDialog", () => {
  it("offers the candidates, then reveals a verdict once one is picked", async () => {
    const user = userEvent.setup();
    render(<RootCauseDialog open onOpenChange={vi.fn()} />);

    expect(screen.getByText("What was the root cause?")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /upstream connection pool/i }),
    );

    expect(screen.getByText("Root cause found")).toBeInTheDocument();
  });
});
