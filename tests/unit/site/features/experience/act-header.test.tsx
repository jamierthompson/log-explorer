import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActHeader } from "@/site/features/experience/act-header/act-header";

describe("ActHeader", () => {
  it("renders the step, kicker, title, and lead", () => {
    render(
      <ActHeader
        step="Act 1"
        kicker="The old way"
        title="A title"
        lead="A lead"
      />,
    );

    expect(screen.getByText("Act 1")).toBeInTheDocument();
    expect(screen.getByText("The old way")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A lead")).toBeInTheDocument();
  });
});
