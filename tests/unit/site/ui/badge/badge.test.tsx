import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/site/ui/badge/badge";

describe("Badge", () => {
  it("renders its content", () => {
    render(<Badge>Act 1</Badge>);
    expect(screen.getByText("Act 1")).toBeInTheDocument();
  });

  it("merges a passed className", () => {
    render(<Badge className="extra">Act 2</Badge>);
    expect(screen.getByText("Act 2")).toHaveClass("extra");
  });
});
