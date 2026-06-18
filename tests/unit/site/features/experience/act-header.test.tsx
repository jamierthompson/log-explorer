import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActHeader } from "@/site/features/experience/act-header/act-header";

describe("ActHeader", () => {
  it("renders the step and kicker as one overline, plus the title and lead", () => {
    render(
      <ActHeader
        step="01"
        kicker="The old way"
        title="A title"
        lead="A lead"
      />,
    );

    expect(screen.getByText("01 — The old way")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A lead")).toBeInTheDocument();
  });
});
