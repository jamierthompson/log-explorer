"use client";

import { useCallback, useState } from "react";

export type Act = "act1" | "act2";

/** Sequences the guided experience: opens on Act 1, advances to Act 2. */
export function useActs() {
  const [act, setAct] = useState<Act>("act1");
  const advance = useCallback(() => setAct("act2"), []);
  return { act, advance };
}
