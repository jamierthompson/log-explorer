import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Eyebrow } from "@/components/ui/eyebrow/eyebrow";

describe("Eyebrow", () => {
  it("renders its label text", () => {
    render(<Eyebrow>Personal project</Eyebrow>);
    expect(screen.getByText("Personal project")).toBeInTheDocument();
  });

  it("merges a caller className with the base class", () => {
    render(<Eyebrow className="extra">Personal project</Eyebrow>);
    expect(screen.getByText("Personal project")).toHaveClass("extra");
  });
});
