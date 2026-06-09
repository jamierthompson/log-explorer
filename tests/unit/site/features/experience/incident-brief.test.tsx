import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IncidentBrief } from "@/site/features/experience/incident-brief/incident-brief";

describe("IncidentBrief", () => {
  it("states the case facts an on-call engineer would walk in with", () => {
    render(<IncidentBrief />);

    expect(
      screen.getByRole("complementary", { name: /incident briefing/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/13:31 UTC/)).toBeInTheDocument();
    expect(screen.getByText("api-gateway")).toBeInTheDocument();
    expect(screen.getByText("checkout 503s")).toBeInTheDocument();
    expect(screen.getByText(/kc4qn · m7w3p · t2x8r/)).toBeInTheDocument();
  });
});
